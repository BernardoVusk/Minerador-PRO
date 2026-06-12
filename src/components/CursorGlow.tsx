import React, { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Hidden on touchscreen/mobile devices to maintain perfect mobile experience
    const mediaQuery = window.matchMedia("(hover: none)");
    if (mediaQuery.matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        // Position glow perfectly at the center of cursor position
        glowRef.current.style.transform = `translate3d(${e.clientX - 175}px, ${e.clientY - 175}px, 0)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 w-[350px] h-[350px] rounded-full mix-blend-screen opacity-[0.16] blur-[60px] pointer-events-none z-50 transition-transform duration-75 ease-out"
      style={{
        background: "radial-gradient(circle, rgba(255, 42, 42, 0.4) 0%, rgba(255, 42, 42, 0.1) 40%, rgba(0, 0, 0, 0) 70%)",
        transform: "translate3d(-400px, -400px, 0)", // Initial hidden position
        willChange: "transform",
      }}
    />
  );
}
