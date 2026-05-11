"use client";

import { useEffect, useMemo, useState } from "react";

export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 900,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const steps = useMemo(() => 30, []);

  useEffect(() => {
    let frame = 0;
    const interval = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / steps, 1);
      setDisplay(Math.round(value * progress));
      if (progress >= 1) {
        window.clearInterval(interval);
      }
    }, duration / steps);

    return () => window.clearInterval(interval);
  }, [duration, steps, value]);

  return (
    <span className="animate-counter-rise">
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
