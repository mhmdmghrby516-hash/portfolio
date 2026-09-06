"use client";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { animate, splitText, stagger } from "animejs";
import MotionHangingCard from "./components/HangingCard";
const portraits = [
  "hero-portraits/portrait-1.jpg",
  "hero-portraits/portrait-2.jpg",
  "hero-portraits/portrait-3.jpg",
  "hero-portraits/portrait-4.jpg",
  "hero-portraits/portrait-5.jpg",
  "hero-portraits/portrait-6.jpg",
];
const techGroups = [
  [
    "Frontend Technologies",
    [
      "React",
      "Next.js",
      "Tailwind CSS",
      "Framer Motion",
      "TypeScript",
      "JavaScript",
      "HTML5",
      "CSS3",
    ],
  ],
  [
    "Backend Technologies",
    ["Node.js", "PHP", "Laravel", "ASP.NET", "Rust", "C#", "Python"],
  ],
  ["Databases & ORMs", ["PostgreSQL", "MySQL", "MongoDB", "Prisma", "Neon"]],
  ["Tools & Infrastructure", ["Git", "Vercel", "Tauri"]],
];
const techSlugs: Record<string, string> = {
  "Next.js": "nextjs",
  "Tailwind CSS": "tailwindcss",
  "Framer Motion": "framermotion",
  "Node.js": "nodejs",
  "ASP.NET": "aspnet",
  "C#": "csharp",
};
const techIcon = (name: string) =>
  name === "Neon"
    ? "https://www.xkintaro.com/stack/neon.png"
    : `https://www.xkintaro.com/stack/${techSlugs[name] || name.toLowerCase().replace(/[^a-z0-9]/g, "")}.svg`;
const projects = [
  ["Aether Media", "Media Tool", "2026", "20260427093247885.jpg"],
  ["Aether JS", "Library", "2026", "20260427093247620.jpg"],
  ["File Manager", "Web Application", "2025", "20260305210513749.jpg"],
];
const years = [
  [
    "2022",
    "I first got introduced to software development in high school. I learned programming fundamentals with C#.",
    "C#",
  ],
  [
    "2023",
    "I started developing static and dynamic websites and exploring databases.",
    "HTML · CSS · ASP.NET · MySQL",
  ],
  [
    "2024",
    "I refined my interface development skills and continued building practical systems.",
    "HTML · CSS · ASP.NET",
  ],
  [
    "2025",
    "I moved into modern tools and created websites and desktop applications.",
    "React · Node.js · MongoDB",
  ],
  [
    "2026",
    "I now focus on Laravel, Next.js and PostgreSQL while building personal products.",
    "Laravel · Next.js · PostgreSQL",
  ],
];
const socialItems = [
  { name: "GitHub", icon: "github" },
  { name: "Discord", icon: "discord" },
  { name: "Instagram", icon: "instagram" },
  { name: "LinkedIn", icon: "linkedin" },
];
function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="section-title reveal">
      <span>[{number}]</span>
      <h2>{title}</h2>
    </div>
  );
}
function Marquee() {
  const w =
    "RADICAL TRANSPARENCY · INTENTIONAL MINIMALISM · ARCHITECTURAL INTEGRITY · FIRST PRINCIPLES THINKING · PERFORMANCE WITHOUT COMPROMISE · SCALABLE VISION · ";
  return (
    <div className="marquee" aria-hidden="true">
      <div>{w.repeat(3)}</div>
    </div>
  );
}

function MouseHeroEffects() {
  const layer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const surface = canvas.current;
    const wrapper = layer.current;
    if (!surface || !wrapper) return;
    const context = surface.getContext("2d");
    if (!context) return;
    const coarse = matchMedia("(pointer: coarse)").matches;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cursor = wrapper.querySelector<HTMLElement>(".hero-cursor");
    let width = innerWidth,
      height = innerHeight,
      dpr = 1,
      raf = 0,
      mouseX = width / 2,
      mouseY = height / 2,
      cursorX = mouseX,
      cursorY = mouseY,
      mouseActive = false,
      previous = performance.now();
    type Particle = {
      homeX: number;
      homeY: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      phase: number;
      speed: number;
      range: number;
      star: boolean;
    };
    let particles: Particle[] = [];
    const seeded = (i: number) => {
      const value = Math.sin(i * 9283.31 + 17.19) * 43758.5453;
      return value - Math.floor(value);
    };
    const createParticles = () => {
      const count = width < 600 ? 110 : width < 1000 ? 170 : 260;
      particles = Array.from({ length: count }, (_, i) => {
        const homeX = seeded(i * 3 + 1) * width;
        const homeY = seeded(i * 3 + 2) * height;
        return {
          homeX,
          homeY,
          x: homeX,
          y: homeY,
          vx: 0,
          vy: 0,
          radius: i % 29 === 0 ? 2 : i % 7 === 0 ? 1.3 : 0.68,
          alpha: 0.18 + seeded(i * 5 + 4) * 0.46,
          phase: seeded(i * 7 + 8) * Math.PI * 2,
          speed: 0.00018 + seeded(i * 11 + 3) * 0.00022,
          range: 7 + seeded(i * 13 + 6) * 18,
          star: i % 29 === 0,
        };
      });
    };
    const resize = () => {
      width = innerWidth;
      height = innerHeight;
      dpr = Math.min(devicePixelRatio || 1, 2);
      surface.width = Math.round(width * dpr);
      surface.height = Math.round(height * dpr);
      surface.style.width = `${width}px`;
      surface.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
    };
    const render = (time: number) => {
      const dt = Math.min(2, (time - previous) / 16.667 || 1);
      previous = time;
      cursorX += (mouseX - cursorX) * 0.17;
      cursorY += (mouseY - cursorY) * 0.17;
      cursor?.style.setProperty(
        "transform",
        `translate3d(${cursorX}px,${cursorY}px,0)`,
      );
      context.clearRect(0, 0, width, height);
      const light = document.documentElement.dataset.theme === "light";
      const color = light ? "18,18,18" : "238,238,236";
      for (const particle of particles) {
        if (!reduced) {
          const driftX =
            Math.sin(time * particle.speed + particle.phase) * particle.range;
          const driftY =
            Math.cos(time * particle.speed * 0.73 + particle.phase * 1.37) *
            particle.range *
            0.72;
          const targetX = particle.homeX + driftX;
          const targetY = particle.homeY + driftY;
          if (mouseActive && !coarse) {
            const dx = particle.x - mouseX;
            const dy = particle.y - mouseY;
            const distance = Math.hypot(dx, dy);
            const radius = 145;
            if (distance < radius && distance > 0) {
              const strength = (1 - distance / radius) ** 2 * 7;
              particle.vx += (dx / distance) * strength * dt;
              particle.vy += (dy / distance) * strength * dt;
            }
          }
          particle.vx += (targetX - particle.x) * 0.012 * dt;
          particle.vy += (targetY - particle.y) * 0.012 * dt;
          particle.vx *= Math.pow(0.91, dt);
          particle.vy *= Math.pow(0.91, dt);
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
        }
        const twinkle = particle.star
          ? 0.7 + 0.3 * Math.sin(time * 0.002 + particle.phase)
          : 0.82 + 0.18 * Math.sin(time * 0.001 + particle.phase);
        context.beginPath();
        const particleColor = particle.star ? "0,212,255" : color;
        context.fillStyle = `rgba(${particleColor},${Math.max(0.075, particle.alpha * twinkle)})`;
        if (particle.star) {
          context.shadowColor = "rgba(0,212,255,.72)";
          context.shadowBlur = 12;
        } else context.shadowBlur = 0;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
      context.shadowBlur = 0;
      raf = requestAnimationFrame(render);
    };
    const onPointer = (event: PointerEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      mouseActive = true;
      document.documentElement.classList.add("cursor-active");
    };
    const onLeave = () => {
      mouseActive = false;
      document.documentElement.classList.remove("cursor-active");
    };
    resize();
    addEventListener("resize", resize);
    addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(render);
    return () => {
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("cursor-active");
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="hero-effects" ref={layer} aria-hidden="true">
      <canvas className="hero-particle-canvas" ref={canvas} />
      <div className="hero-cursor">
        <span />
      </div>
    </div>
  );
}

export function HangingCard() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = root.current;
    const surface = canvas.current;
    const element = card.current;
    if (!container || !surface || !element) return;
    const context = surface.getContext("2d");
    if (!context) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const segmentCount = 13;
    const ropeLength = 184;
    type Point = { x: number; y: number; oldX: number; oldY: number };
    let points: Point[] = [];
    let frame = 0;
    let previous = performance.now();
    let dragging = false;
    let pointerId = -1;
    let pointerX = 0;
    let pointerY = 0;
    let pointerNear = false;
    let rotation = 0;
    let hoverAmount = 0;
    const reset = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      surface.width = Math.round(container.clientWidth * dpr);
      surface.height = Math.round(container.clientHeight * dpr);
      surface.style.width = `${container.clientWidth}px`;
      surface.style.height = `${container.clientHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const anchorX = container.clientWidth / 2;
      points = Array.from({ length: segmentCount }, (_, index) => {
        const y = (ropeLength * index) / (segmentCount - 1);
        return { x: anchorX, y, oldX: anchorX, oldY: y };
      });
    };
    const localPointer = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
    };
    const beginDrag = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragging = true;
      pointerId = event.pointerId;
      localPointer(event);
      pointerY = Math.max(8, pointerY);
      element.setPointerCapture(pointerId);
      element.classList.add("is-dragging");
      event.preventDefault();
    };
    const movePointer = (event: PointerEvent) => {
      localPointer(event);
      pointerY = Math.max(8, pointerY);
      pointerNear = true;
    };
    const leavePointer = () => { pointerNear = false; };
    const endDrag = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      pointerId = -1;
      element.classList.remove("is-dragging");
    };
    const drawRope = () => {
      if (!points.length) return;
      context.clearRect(0, 0, container.clientWidth, container.clientHeight);
      const light = document.documentElement.dataset.theme === "light";
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      for (let index = 1; index < points.length - 1; index++) {
        const point = points[index];
        const next = points[index + 1];
        context.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
      }
      const last = points[points.length - 1];
      context.lineTo(last.x, last.y);
      const ropeGradient = context.createLinearGradient(points[0].x - 3, 0, points[0].x + 5, 0);
      if (light) {
        ropeGradient.addColorStop(0, "rgba(15,15,15,.18)");
        ropeGradient.addColorStop(0.48, "rgba(15,15,15,.62)");
        ropeGradient.addColorStop(1, "rgba(255,255,255,.24)");
      } else {
        ropeGradient.addColorStop(0, "rgba(0,0,0,.42)");
        ropeGradient.addColorStop(0.5, "rgba(238,238,235,.58)");
        ropeGradient.addColorStop(1, "rgba(255,255,255,.14)");
      }
      context.strokeStyle = ropeGradient;
      context.lineWidth = 1.65;
      context.lineCap = "round";
      context.shadowColor = light ? "rgba(0,0,0,.14)" : "rgba(255,255,255,.08)";
      context.shadowBlur = 3;
      context.stroke();
      context.shadowBlur = 0;
      context.beginPath();
      context.arc(points[0].x, points[0].y, 5, 0, Math.PI * 2);
      context.fillStyle = light ? "#eeeae2" : "#080808";
      context.fill();
      context.strokeStyle = light ? "rgba(20,20,20,.52)" : "rgba(232,232,228,.48)";
      context.lineWidth = 2;
      context.stroke();
    };
    const render = (time: number) => {
      const dt = Math.min(1.7, (time - previous) / 16.667 || 1);
      previous = time;
      const anchorX = container.clientWidth / 2;
      const segmentLength = ropeLength / (segmentCount - 1);
      if (!reduced) {
        for (let index = 1; index < points.length; index++) {
          const point = points[index];
          const velocityX = (point.x - point.oldX) * 0.985;
          const velocityY = (point.y - point.oldY) * 0.985;
          point.oldX = point.x;
          point.oldY = point.y;
          point.x += velocityX * dt;
          point.y += velocityY * dt + 0.075 * dt * dt;
        }
        if (pointerNear && !dragging) {
          for (let index = 1; index < points.length; index++) {
            const point = points[index];
            const dx = point.x - pointerX;
            const dy = point.y - pointerY;
            const distance = Math.max(8, Math.hypot(dx, dy));
            if (distance < 105) {
              const force = (1 - distance / 105) ** 2 * 0.62;
              point.x -= (dx / distance) * force;
              point.y -= (dy / distance) * force;
            }
          }
        }
        const bottom = points[points.length - 1];
        const idleWave = Math.sin(time * 0.00138);
        const idleCounterWave = Math.cos(time * 0.00107 + 0.8);
        bottom.x += idleWave * 0.022;
        bottom.y += idleCounterWave * 0.006;
        if (dragging) {
          bottom.x += (pointerX - bottom.x) * 0.36;
          bottom.y += (pointerY - bottom.y) * 0.36;
          bottom.oldX += (bottom.x - bottom.oldX) * 0.08;
          bottom.oldY += (bottom.y - bottom.oldY) * 0.08;
        }
        for (let iteration = 0; iteration < 7; iteration++) {
          points[0].x = anchorX;
          points[0].y = 0;
          for (let index = 0; index < points.length - 1; index++) {
            const first = points[index];
            const second = points[index + 1];
            const dx = second.x - first.x;
            const dy = second.y - first.y;
            const distance = Math.max(0.001, Math.hypot(dx, dy));
            const correction = (distance - segmentLength) / distance;
            if (index === 0) {
              second.x -= dx * correction;
              second.y -= dy * correction;
            } else {
              const elasticity = dragging && index === points.length - 2 ? 0.36 : 0.5;
              first.x += dx * correction * elasticity;
              first.y += dy * correction * elasticity;
              second.x -= dx * correction * elasticity;
              second.y -= dy * correction * elasticity;
            }
            second.y = Math.max(0, second.y);
          }
        }
      }
      const bottom = points[points.length - 1];
      const beforeBottom = points[points.length - 2];
      const velocityX = bottom.x - bottom.oldX;
      const velocityY = bottom.y - bottom.oldY;
      const cardCenterX = bottom.x;
      const cardCenterY = bottom.y + element.offsetHeight / 2;
      const pointerDistance = Math.hypot(pointerX - cardCenterX, pointerY - cardCenterY);
      const proximity = pointerNear && !dragging ? Math.max(0, 1 - pointerDistance / 175) : dragging ? 0.7 : 0;
      hoverAmount += (proximity - hoverAmount) * 0.085;
      const ropeAngle = Math.atan2(bottom.y - beforeBottom.y, bottom.x - beforeBottom.x) * 180 / Math.PI - 90;
      const targetRotation = Math.max(-13, Math.min(13, ropeAngle * 0.34 + velocityX * 1.35));
      rotation += (targetRotation - rotation) * 0.12;
      drawRope();
      const pointerTiltX = ((pointerY - cardCenterY) / 175) * -3.5 * hoverAmount;
      const pointerTiltY = ((pointerX - cardCenterX) / 175) * 5.5 * hoverAmount;
      const tiltX = Math.max(-6, Math.min(6, velocityY * -0.8 + pointerTiltX));
      const tiltY = Math.max(-10, Math.min(10, velocityX * 1.15 + pointerTiltY));
      const scale = 1 + hoverAmount * 0.055;
      element.style.setProperty("--card-hover-shadow", `${(hoverAmount * 10).toFixed(2)}px`);
      element.style.transform = `translate3d(${(bottom.x - element.offsetWidth / 2).toFixed(2)}px,${bottom.y.toFixed(2)}px,0) rotateZ(${rotation.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) rotateX(${tiltX.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      frame = requestAnimationFrame(render);
    };
    reset();
    addEventListener("resize", reset);
    addEventListener("pointermove", movePointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", leavePointer);
    element.addEventListener("pointerdown", beginDrag);
    element.addEventListener("pointermove", movePointer);
    element.addEventListener("pointerup", endDrag);
    element.addEventListener("pointercancel", endDrag);
    frame = requestAnimationFrame(render);
    return () => {
      removeEventListener("resize", reset);
      removeEventListener("pointermove", movePointer);
      document.documentElement.removeEventListener("pointerleave", leavePointer);
      element.removeEventListener("pointerdown", beginDrag);
      element.removeEventListener("pointermove", movePointer);
      element.removeEventListener("pointerup", endDrag);
      element.removeEventListener("pointercancel", endDrag);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div className="hanging-card" ref={root}>
      <canvas className="hanging-rope" ref={canvas} aria-hidden="true" />
      <div className="badge-card" ref={card} role="button" tabIndex={0} aria-label="Drag the hanging profile card">
        <div className="badge-avatar">♙</div>
        <b>MOHAMMAD MOGHRABY</b>
        <span>Web Developer</span>
      </div>
    </div>
  );
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

export function getCircularTransitionGeometry(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const keyboardClick = event.detail === 0;
  const x = keyboardClick ? rect.left + rect.width / 2 : event.clientX;
  const y = keyboardClick ? rect.top + rect.height / 2 : event.clientY;
  const radius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  );
  return { x, y, radius };
}

export function startCircularThemeTransition(
  event: MouseEvent<HTMLElement>,
  applyTheme: () => void,
) {
  const { x, y, radius } = getCircularTransitionGeometry(event);
  const root = document.documentElement;
  root.style.setProperty("--theme-transition-x", `${x}px`);
  root.style.setProperty("--theme-transition-y", `${y}px`);
  root.style.setProperty("--theme-transition-radius", `${radius}px`);
  const doc = document as ViewTransitionDocument;
  if (
    !doc.startViewTransition ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    applyTheme();
    return;
  }
  doc.startViewTransition(applyTheme).ready.catch(() => undefined);
}

export default function Home() {
  const [light, setLight] = useState(false);
  const [menu, setMenu] = useState(false);
  const projectTrack = useRef<HTMLDivElement>(null);
  const heroTitle = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (
      !heroTitle.current ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const split = splitText(heroTitle.current, {
      lines: { wrap: "clip", class: "hero-title-line" },
      chars: { class: "hero-title-char" },
      accessible: true,
    });

    split.addEffect(({ chars }) => {
      const play = () => {
        animate(chars, {
          opacity: { from: 0 },
          y: { from: "115%" },
          rotate: { from: 3 },
          scale: { from: 0.96 },
          duration: 850,
          delay: stagger(26),
          ease: "out(4)",
        });
      };

      const target = heroTitle.current;
      target?.addEventListener("pointerenter", play);
      target?.addEventListener("pointerdown", play);

      return () => {
        target?.removeEventListener("pointerenter", play);
        target?.removeEventListener("pointerdown", play);
      };
    });

    return () => {
      split.revert();
    };
  }, []);
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach(
          (e) => e.isIntersecting && e.target.classList.add("visible"),
        ),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".hero-copy,.portrait-wall,.content-section>*,.marquee>div,.projects-intro,.project-card",
      ),
    );
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = innerHeight;
      targets.forEach((el) => {
        let blur = 0;
        let opacity = 1;
        if (el.closest(".hero")) {
          const progress = Math.min(1, scrollY / (vh * 0.72));
          blur = progress * 10;
          opacity = 1 - progress * 0.42;
        } else {
          const effectArea = el.closest<HTMLElement>("section") ?? el;
          const rect = effectArea.getBoundingClientRect();
          const viewportCenter = vh / 2;
          const distance =
            rect.top > viewportCenter
              ? rect.top - viewportCenter
              : rect.bottom < viewportCenter
                ? viewportCenter - rect.bottom
                : 0;
          const progress = Math.min(1, distance / (vh * 0.88));
          blur = Math.max(0, (progress - 0.18) * 11);
          opacity = 1 - Math.max(0, progress - 0.48) * 0.5;
        }
        el.style.setProperty("--scroll-blur", `${blur.toFixed(2)}px`);
        el.style.setProperty("--scroll-opacity", opacity.toFixed(3));
      });
    };
    const onMove = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    addEventListener("scroll", onMove, { passive: true });
    addEventListener("resize", onMove);
    update();
    return () => {
      removeEventListener("scroll", onMove);
      removeEventListener("resize", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const section = document.getElementById("projects");
      const track = projectTrack.current;
      if (!section || !track) return;
      if (innerWidth < 901) {
        track.style.transform = "none";
        return;
      }
      const range = Math.max(1, section.offsetHeight - innerHeight);
      const progress = Math.max(
        0,
        Math.min(1, (scrollY - section.offsetTop) / range),
      );
      const distance = Math.max(
        0,
        track.scrollWidth - innerWidth + innerWidth * 0.05,
      );
      track.style.transform = `translate3d(${-progress * distance}px,0,0)`;
    };
    const onMove = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    addEventListener("scroll", onMove, { passive: true });
    addEventListener("resize", onMove);
    update();
    return () => {
      removeEventListener("scroll", onMove);
      removeEventListener("resize", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timeline = document.querySelector<HTMLElement>(".timeline");
    const hero = document.getElementById("home");
    const portraits = Array.from(
      document.querySelectorAll<HTMLElement>(".portrait"),
    );
    const speeds = [-0.055, 0.035, -0.075, 0.05, -0.04, 0.065];
    const rotations = [-1.6, 1.2, -1, 0.8, -1.3, 1.5];
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = innerHeight;
      if (timeline) {
        const rect = timeline.getBoundingClientRect();
        const progress = Math.max(
          0,
          Math.min(1, (vh * 0.52 - rect.top) / Math.max(1, rect.height)),
        );
        timeline.style.setProperty("--timeline-progress", progress.toFixed(4));
        const entries = Array.from(
          timeline.querySelectorAll<HTMLElement>(".year"),
        );
        let active: HTMLElement | null = null;
        let nearest = Infinity;
        entries.forEach((entry) => {
          const dot = entry.querySelector<HTMLElement>(".year-dot");
          if (!dot) return;
          const dotRect = dot.getBoundingClientRect();
          const distance = Math.abs(dotRect.top + dotRect.height / 2 - vh / 2);
          if (distance < nearest && dotRect.bottom > 0 && dotRect.top < vh) {
            nearest = distance;
            active = entry;
          }
        });
        entries.forEach((entry) =>
          entry.classList.toggle("is-active", entry === active),
        );
      }
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const progress = Math.max(
          0,
          Math.min(1, -rect.top / Math.max(1, rect.height - vh * 0.2)),
        );
        portraits.forEach((portrait, i) => {
          portrait.style.setProperty(
            "--parallax-y",
            `${(progress * vh * speeds[i]).toFixed(2)}px`,
          );
          portrait.style.setProperty(
            "--parallax-rotate",
            `${(progress * rotations[i]).toFixed(2)}deg`,
          );
        });
      }
    };
    const onMove = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    addEventListener("scroll", onMove, { passive: true });
    addEventListener("resize", onMove);
    update();
    return () => {
      removeEventListener("scroll", onMove);
      removeEventListener("resize", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  const toggleTheme = (event: MouseEvent<HTMLButtonElement>) => {
    const next = !light;
    startCircularThemeTransition(event, () =>
      flushSync(() => {
        document.documentElement.dataset.theme = next ? "light" : "dark";
        setLight(next);
      }),
    );
  };
  const jump = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
    setMenu(false);
  };
  return (
    <main>
      <MouseHeroEffects />
      <header>
        <button className="brand" onClick={() => jump("#home")}>
          MOGHRABY
        </button>
        <nav className={menu ? "open" : ""}>
          {["Home", "About", "Stack", "Projects", "Roadmap", "Contact"].map(
            (x) => (
              <button key={x} onClick={() => jump(`#${x.toLowerCase()}`)}>
                {x}
              </button>
            ),
          )}
        </nav>
        <div className="controls">
          <button
            className={`theme-toggle${light ? " is-light" : ""}`}
            aria-label={`Switch to ${light ? "dark" : "light"} mode`}
            aria-pressed={light}
            onClick={toggleTheme}
          >
            <span className="theme-sun" aria-hidden="true">
              ☀
            </span>
            <span className="theme-moon" aria-hidden="true">
              ☾
            </span>
          </button>
          <button
            className="menu"
            aria-label="Menu"
            onClick={() => setMenu(!menu)}
          >
            ☰
          </button>
        </div>
      </header>
      <section id="home" className="hero">
        <div className="noise" />
        <div className="stars" />
        <div className="hero-copy reveal visible">
          <p className="eyebrow">WEB DEVELOPER · 2026</p>
          <h1 ref={heroTitle}>
            MOHAMMAD
            <br />
            <span className="surname">MOGHRABY</span>
          </h1>
          <p className="intro">
            I&apos;m someone who loves <b>learning new things</b> and constantly
            tries to put what I learn into practice. I develop <i>web</i> and{" "}
            <i>desktop</i> applications. I enjoy working with simple,{" "}
            <b>practical</b>, and <b>sustainable</b> tools.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => jump("#contact")}>
              CONTACT ME <span>→</span>
            </button>
            <button className="text-btn" onClick={() => jump("#projects")}>
              ◉ &nbsp; EXPLORE PROJECTS
            </button>
          </div>
        </div>
        <div className="portrait-wall" aria-hidden="true">
          {[portraits.slice(0, 3), portraits.slice(3, 6)].map(
            (column, columnIndex) => (
              <div
                className={`portrait-column portrait-column-${columnIndex + 1}`}
                key={columnIndex}
              >
                <div className="portrait-track">
                  <div className="portrait-set">
                    {column.map((src, imageIndex) => (
                      <div className="portrait" key={src}>
                        <img
                          src={src}
                          alt=""
                          loading={imageIndex === 0 ? "eager" : "lazy"}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </section>
      <section id="about" className="content-section about">
        <div className="about-grid">
          <aside className="about-side">
            <SectionTitle number="001" title="About" />
            <div className="badge-rig reveal">
              <MotionHangingCard />
            </div>
          </aside>
          <div className="about-copy">
            <h3 className="reveal">
              I&apos;m a <em>Web Developer</em> focused on building{" "}
              <strong>clean and sustainable systems</strong>.
            </h3>
            <p className="reveal">
              I&apos;m someone who loves <b>learning new things</b> and
              constantly tries to put what I learn into practice. I develop{" "}
              <i>web</i> and <i>desktop</i> applications. I enjoy working with
              simple, <b>practical</b>, and <b>sustainable</b> tools.
            </p>
            <button className="about-link reveal">
              READ FULL VERSION <span>→</span>
            </button>
          </div>
        </div>
      </section>
      <Marquee />
      <section id="stack" className="content-section">
        <SectionTitle number="002" title="Stack" />
        <div className="stack-list">
          {techGroups.map(([title, items], i) => (
            <article className="tech-row reveal" key={title as string}>
              <div className="tech-heading">
                <span>0{i + 1}</span>
                <h3>{title}</h3>
              </div>
              <div className="tech-items">
                {(items as string[]).map((item) => (
                  <div className="tech-item" key={item}>
                    <img src={techIcon(item)} alt="" />
                    <b>{item}</b>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <Marquee />
      <section id="projects" className="projects">
        <div className="projects-sticky">
          <div className="project-track" ref={projectTrack}>
            <div className="projects-intro">
              <SectionTitle number="003" title="Projects" />
              <p className="reveal">
                A collection of <em>experiments</em>, <em>products</em>, and{" "}
                <em>digital artifacts</em> forged in the <strong>void</strong>.
              </p>
              <div className="explore-line">
                <i />
                SCROLL TO EXPLORE
              </div>
            </div>
            {projects.map(([name, type, year, img]) => (
              <article className="project-card reveal" key={name}>
                <div className="project-image">
                  <img
                    src={`https://www.xkintaro.com/projects/${img}`}
                    alt={name}
                  />
                  <div className="project-meta">
                    <span>{type}</span>
                    <b>{year}</b>
                  </div>
                  <h3>{name}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Marquee />
      <section id="roadmap" className="content-section roadmap">
        <SectionTitle number="004" title="Roadmap" />
        <p className="section-lead reveal">
          A timeline of the experiences and technologies that shaped my software
          journey.
        </p>
        <div className="timeline reveal">
          <div className="timeline-base" />
          <div className="timeline-fill" />
          {years.map(([year, desc, tags], i) => (
            <article
              className={`year reveal ${i % 2 ? "year-right" : "year-left"}`}
              style={{ transitionDelay: `${i * 110}ms` }}
              key={year}
            >
              <div className="year-dot">
                <i />
              </div>
              <div className="year-card">
                <span className="year-index">0{i + 1}</span>
                <h3>{year}</h3>
                <p>{desc}</p>
                <div className="year-tags">
                  {tags.split(" · ").map((tag) => (
                    <b key={tag}>{tag}</b>
                  ))}
                </div>
                <em>{year.slice(2)}</em>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Marquee />
      <section id="contact" className="content-section contact">
        <SectionTitle number="005" title="Contact" />
        <h3 className="reveal">
          Whether we start fresh to bring a project to life or take an existing
          system further.
        </h3>
        <div className="contact-details reveal">
          <a className="contact-row" href="mailto:mhmdmghrby516@gmail.com">
            <span>Send an Email</span>
            <div>
              <b>mhmdmghrby516@gmail.com</b>
              <i>↗</i>
            </div>
          </a>
          <a className="contact-row" href="tel:+963938974788">
            <span>Direct Line</span>
            <div>
              <b>0938974788</b>
              <i>↗</i>
            </div>
          </a>
        </div>
        <footer>
          <div className="social-pills" aria-label="Social platforms">
            {socialItems.map(({ name, icon }) => (
              <button
                type="button"
                key={name}
                aria-label={`${name} link coming soon`}
              >
                  <span className="social-label">{name}</span>
                  <span className="social-icon" aria-hidden="true">
                    <i>
                      <img src={`social-icons/${icon}.svg`} alt="" />
                    </i>
                    <i>↗</i>
                  </span>
              </button>
            ))}
          </div>
          <div className="copyright">
            © 2026 <b>MOHAMMAD MOGHRABY.</b> All rights reserved.
          </div>
        </footer>
      </section>
    </main>
  );
}
