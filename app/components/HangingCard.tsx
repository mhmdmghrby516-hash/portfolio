"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import styles from "./HangingCard.module.css";

export type HangingCardProps = { children?: ReactNode; className?: string; ariaLabel?: string };

const MAX_ANGLE = Math.PI * 0.58;

export default function HangingCard({ children, className = "", ariaLabel = "Drag the hanging profile card" }: HangingCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const angularVelocity = useRef(0);
  const targetAngle = useRef(0);
  const dragging = useRef(false);
  const lastFrame = useRef(0);
  const [size, setSize] = useState({ width: 340, height: 390 });
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const bend = useMotionValue(0);
  const rawRotation = useMotionValue(0);
  const pointerTiltX = useMotionValue(0);
  const pointerTiltY = useMotionValue(0);
  const rotation = useSpring(rawRotation, { stiffness: 150, damping: 18, mass: 0.65 });
  const tiltX = useSpring(pointerTiltX, { stiffness: 160, damping: 21 });
  const tiltY = useSpring(pointerTiltY, { stiffness: 160, damping: 21 });
  const anchorX = size.width / 2;
  const anchorY = 10;
  const ropeLength = Math.max(158, Math.min(190, size.height * 0.49));

  const ropePath = useTransform([x, y, bend], ([offsetX, offsetY, curve]) => {
    const endX = anchorX + Number(offsetX);
    const endY = anchorY + ropeLength + Number(offsetY);
    const dx = endX - anchorX;
    const dy = endY - anchorY;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const normalX = -dy / distance;
    const normalY = dx / distance;
    const flex = Number(curve);
    return `M ${anchorX} ${anchorY} C ${anchorX + dx * 0.34 + normalX * flex * 0.35} ${anchorY + dy * 0.34 + normalY * flex * 0.35}, ${anchorX + dx * 0.7 + normalX * flex} ${anchorY + dy * 0.7 + normalY * flex}, ${endX} ${endY}`;
  });

  const updateFromAngle = useCallback((nextAngle: number, velocity: number) => {
    x.set(Math.sin(nextAngle) * ropeLength);
    y.set(Math.cos(nextAngle) * ropeLength - ropeLength);
    bend.set(Math.max(-18, Math.min(18, -velocity * 9)));
    rawRotation.set((nextAngle * 180) / Math.PI * 0.68 + velocity * 4.5);
  }, [bend, rawRotation, ropeLength, x, y]);

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
      angle.current = 0;
      angularVelocity.current = 0;
      updateFromAngle(0, 0);
      return;
    }
    let frame = 0;
    const tick = (time: number) => {
      const dt = Math.min(0.032, Math.max(0.001, (time - (lastFrame.current || time)) / 1000));
      lastFrame.current = time;
      let acceleration: number;
      if (dragging.current) {
        acceleration = (targetAngle.current - angle.current) * 58 - angularVelocity.current * 10.5;
      } else {
        const idleForce = Math.abs(angle.current) < 0.08 && Math.abs(angularVelocity.current) < 0.12 ? Math.sin(time * 0.00115) * 0.025 : 0;
        acceleration = -Math.sin(angle.current) * 21.5 - angularVelocity.current * 2.15 + idleForce;
      }
      angularVelocity.current += acceleration * dt;
      angle.current += angularVelocity.current * dt;
      if (Math.abs(angle.current) > MAX_ANGLE) {
        angle.current = Math.sign(angle.current) * MAX_ANGLE;
        angularVelocity.current *= -0.28;
      }
      updateFromAngle(angle.current, angularVelocity.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); lastFrame.current = 0 };
  }, [reducedMotion, updateFromAngle]);

  const updateTarget = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const dx = event.clientX - (rect.left + anchorX);
    const dy = event.clientY - (rect.top + anchorY);
    targetAngle.current = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, Math.atan2(dx, Math.max(12, dy))));
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    dragging.current = true;
    angularVelocity.current *= 0.25;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateTarget(event);
  };

  const moveCard = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerTiltX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 4.5);
    pointerTiltY.set(((event.clientX - rect.left) / rect.width - 0.5) * 6);
    if (dragging.current) updateTarget(event);
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    pointerTiltX.set(0);
    pointerTiltY.set(0);
  };

  return (
    <div ref={containerRef} className={`${styles.root} ${className}`} dir="auto">
      <svg className={styles.rope} viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="hanging-rope-gradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="currentColor" stopOpacity="0.16" /><stop offset="0.52" stopColor="currentColor" stopOpacity="0.58" /><stop offset="1" stopColor="currentColor" stopOpacity="0.2" /></linearGradient></defs>
        <motion.path d={ropePath} className={styles.ropePath} />
        <circle cx={anchorX} cy={anchorY} r="5" className={styles.anchor} />
      </svg>
      <motion.div className={styles.cardPosition} style={{ left: anchorX, top: anchorY + ropeLength, x, y }}>
        <motion.div className={styles.card} role="group" aria-label={ariaLabel} style={{ rotateZ: rotation, rotateX: tiltX, rotateY: tiltY }} whileHover={reducedMotion ? undefined : { scale: 1.045 }} whileTap={reducedMotion ? undefined : { scale: 1.025, cursor: "grabbing" }} onPointerDown={startDrag} onPointerMove={moveCard} onPointerUp={finishDrag} onPointerCancel={finishDrag} onPointerLeave={() => { if (!dragging.current) { pointerTiltX.set(0); pointerTiltY.set(0) } }}>
          <span className={styles.connector} aria-hidden="true" />
          {children ?? <><div className={styles.avatar}>♙</div><strong>MOHAMMAD MOGHRABY</strong><small>Web Developer</small></>}
        </motion.div>
      </motion.div>
    </div>
  );
}
