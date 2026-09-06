"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type AnimationPlaybackControls,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./HangingCard.module.css";

export type HangingCardProps = {
  children?: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export default function HangingCard({ children, className = "", ariaLabel = "Drag the hanging profile card" }: HangingCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const idleX = useRef<AnimationPlaybackControls | null>(null);
  const idleY = useRef<AnimationPlaybackControls | null>(null);
  const [size, setSize] = useState({ width: 300, height: 360 });
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const pointerTiltX = useMotionValue(0);
  const pointerTiltY = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 105, damping: 18, mass: 0.7 });
  const smoothY = useSpring(y, { stiffness: 120, damping: 20, mass: 0.75 });
  const velocityX = useVelocity(smoothX);
  const baseRotation = useTransform([smoothX, velocityX], ([position, velocity]) => {
    const range = size.width < 260 ? 7 : 11;
    return Math.max(-range, Math.min(range, Number(position) * 0.055 + Number(velocity) * 0.012));
  });
  const rotation = useSpring(baseRotation, { stiffness: 130, damping: 17 });
  const tiltX = useSpring(pointerTiltX, { stiffness: 150, damping: 20 });
  const tiltY = useSpring(pointerTiltY, { stiffness: 150, damping: 20 });
  const anchorX = size.width / 2;
  const anchorY = 10;
  const ropeLength = Math.max(145, Math.min(185, size.height * 0.5));
  const ropePath = useTransform([smoothX, smoothY], ([offsetX, offsetY]) => {
    const endX = anchorX + Number(offsetX);
    const endY = anchorY + ropeLength + Number(offsetY);
    const bend = Number(offsetX) * 0.44;
    const control1X = anchorX + bend * 0.18;
    const control1Y = anchorY + ropeLength * 0.34;
    const control2X = endX - bend * 0.2;
    const control2Y = endY - ropeLength * 0.34;
    return `M ${anchorX} ${anchorY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
  });

  const stopIdle = useCallback(() => {
    idleX.current?.stop();
    idleY.current?.stop();
  }, []);

  const startIdle = useCallback(() => {
    if (reducedMotion) return;
    stopIdle();
    idleX.current = animate(x, [0, 4, -3, 0], { duration: 5, repeat: Infinity, ease: "easeInOut" });
    idleY.current = animate(y, [0, -2.5, 1.5, 0], { duration: 4.6, repeat: Infinity, ease: "easeInOut" });
  }, [reducedMotion, stopIdle, x, y]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => setSize({ width: container.clientWidth, height: container.clientHeight });
    const observer = new ResizeObserver(update);
    observer.observe(container);
    update();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      x.set(0);
      y.set(0);
      return;
    }
    startIdle();
    return stopIdle;
  }, [reducedMotion, startIdle, stopIdle, x, y]);

  const finishDrag = () => {
    const returnX = animate(x, 0, { type: "spring", stiffness: 48, damping: 8, mass: 0.85 });
    const returnY = animate(y, 0, { type: "spring", stiffness: 58, damping: 10, mass: 0.8 });
    Promise.all([returnX, returnY]).then(startIdle).catch(() => undefined);
  };

  const moveTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    pointerTiltX.set(-ny * 5);
    pointerTiltY.set(nx * 7);
  };

  const resetTilt = () => {
    pointerTiltX.set(0);
    pointerTiltY.set(0);
  };

  const horizontalRange = Math.max(24, Math.min(size.width * 0.28, size.width < 260 ? 48 : 82));
  const verticalRange = size.width < 260 ? 22 : 38;

  return (
    <div ref={containerRef} className={`${styles.root} ${className}`} dir="auto">
      <svg className={styles.rope} viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="hanging-rope-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.16" />
            <stop offset="0.52" stopColor="currentColor" stopOpacity="0.58" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <motion.path d={ropePath} className={styles.ropePath} />
        <circle cx={anchorX} cy={anchorY} r="5" className={styles.anchor} />
      </svg>
      <motion.div
        className={styles.cardPosition}
        style={{ left: anchorX, top: anchorY + ropeLength, x, y }}
        drag={!reducedMotion}
        dragConstraints={{ left: -horizontalRange, right: horizontalRange, top: -verticalRange, bottom: verticalRange }}
        dragElastic={0.12}
        dragMomentum
        dragTransition={{ power: 0.14, timeConstant: 260, bounceStiffness: 180, bounceDamping: 22 }}
        onDragStart={stopIdle}
        onDragEnd={finishDrag}
      >
        <motion.div
          className={styles.card}
          role="group"
          aria-label={ariaLabel}
          style={{ rotateZ: rotation, rotateX: tiltX, rotateY: tiltY }}
          whileHover={reducedMotion ? undefined : { scale: 1.055 }}
          whileTap={reducedMotion ? undefined : { scale: 1.025, cursor: "grabbing" }}
          onPointerMove={moveTilt}
          onPointerLeave={resetTilt}
        >
          <span className={styles.connector} aria-hidden="true" />
          {children ?? (
            <>
              <div className={styles.avatar}>♙</div>
              <strong>MOHAMMAD MOGHRABY</strong>
              <small>Web Developer</small>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
