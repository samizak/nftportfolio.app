"use client";

import { useEffect, useRef, ReactNode } from "react";
import Lenis from "lenis";

interface LenisScrollerProps {
  children: ReactNode;
}

export default function LenisScroller({ children }: LenisScrollerProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis();
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
