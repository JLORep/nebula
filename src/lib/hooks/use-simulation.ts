"use client";

import { useEffect } from "react";
import { useSimulationStore } from "@/lib/stores/simulation-store";

export function useSimulation() {
  const start = useSimulationStore((s) => s.start);
  const stop = useSimulationStore((s) => s.stop);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);
}
