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
  const velocityX = useVelocity(x);
  const velocityY = useVelocity(y);
  const baseRotation = useTransform([x, velocityX], ([position, velocity]) => {
    const range = size.width < 260 ? 7 : 11;
    return Math.max(-range, Math.min(range, Number(position) * 0.065 + Number(velocity) * 0.016));
  });
  const rotation = useSpring(baseRotation, { stiffness: 115, damping: 14, mass: 0.72 });
  const tiltX = useSpring(pointerTiltX, { stiffness: 150, damping: 20 });
  const tiltY = useSpring(pointerTiltY, { stiffness: 150, damping: 20 });
  const anchorX = size.width / 2;
  const anchorY = 10;
  const ropeLength = Math.max(145, Math.min(185, size.height * 0.5));
  const ropePath = useTransform([x, y, velocityX, velocityY], ([offsetX, offsetY, speedX, speedY]) => {
    const endX = anchorX + Number(offsetX);
    const endY = anchorY + ropeLength + Number(offsetY);
    const direction = Number(offsetX);
    const trailingForce = Math.max(-34, Math.min(34, -Number(speedX) * 0.025));
    const verticalLag = Math.max(-10, Math.min(10, -Number(speedY) * 0.012));
    const control1X = anchorX + direction * 0.08 + trailingForce * 0.18;
    const control1Y = anchorY + ropeLength * 0.32;
    const control2X = endX - direction * 0.24 + trailingForce;
    const control2Y = endY - ropeLength * 0.28 + verticalLag;
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
    const releaseX = velocityX.get();
    const releaseY = velocityY.get();
    const returnX = animate(x, 0, {
      type: "spring",
      velocity: releaseX,
      stiffness: 44,
      damping: 8.5,
      mass: 0.92,
      restSpeed: 3,
      restDelta: 0.35,
    });
    const returnY = animate(y, 0, {
      type: "spring",
      velocity: releaseY * 0.45,
      stiffness: 62,
      damping: 11,
      mass: 0.82,
      restSpeed: 3,
      restDelta: 0.35,
    });
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
        dragMomentum={false}
        onDragStart={stopIdle}
        onDragEnd={finishDrag}
      >
        <motion.div
          className={styles.card}
          role="group"
          aria-label={ariaLabel}
          style={{ rotateZ: rotation, rotateX: tiltX, rotateY: tiltY }}
          whileHover={reducedMotion ? undefined : { scale: 1.055 }}
          whileTap={reducedMotion ? undefined : { scale: 1.035, cursor: "grabbing" }}
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
