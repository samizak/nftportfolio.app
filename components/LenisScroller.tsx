"use client";

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
  createContext,
  useContext,
} from "react";
import Lenis from "lenis";

// Create a context for the Lenis instance
const LenisContext = createContext<Lenis | null>(null);

// Custom hook to use the Lenis context
export const useLenis = () => useContext(LenisContext);

interface LenisScrollerProps {
  children: ReactNode;
}

export default function LenisScroller({ children }: LenisScrollerProps) {
  // Use useState to hold the Lenis instance
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  // Keep ref for cleanup
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis();
    lenisRef.current = lenis; // Store ref for cleanup
    setLenisInstance(lenis); // Set state to update context

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // No need to store in ref again here

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null); // Clean up state
    };
  }, []);

  return (
    // Provide the state variable to the context
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
}
