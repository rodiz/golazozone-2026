"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  targetDate: Date | string;
  className?: string;
  onExpire?: () => void;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer({
  targetDate,
  className,
  onExpire,
  compact = false,
}: CountdownTimerProps) {
  const targetTime = new Date(targetDate).getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const target = new Date(targetTime);
    setTimeLeft(getTimeLeft(target));
    setMounted(true);

    const timer = setInterval(() => {
      const tl = getTimeLeft(target);
      setTimeLeft(tl);
      if (tl.days === 0 && tl.hours === 0 && tl.minutes === 0 && tl.seconds === 0) {
        setExpired(true);
        onExpire?.();
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTime, onExpire]);

  if (!mounted) {
    return null; // Avoid hydration mismatch by not rendering until mounted
  }

  if (expired) {
    return <span className={cn("text-[var(--danger)] font-semibold text-xs", className)}>Cerrado</span>;
  }

  if (compact) {
    const parts = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    if (timeLeft.hours > 0) parts.push(`${timeLeft.hours}h`);
    parts.push(`${String(timeLeft.minutes).padStart(2, "0")}m`);
    parts.push(`${String(timeLeft.seconds).padStart(2, "0")}s`);
    return (
      <span className={cn("text-xs font-mono text-[var(--warning)]", className)}>
        ⏰ {parts.join(" ")}
      </span>
    );
  }

  const Unit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold font-display text-[var(--accent)] tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
    </div>
  );

  const Sep = () => <span className="text-2xl font-bold text-[var(--text-muted)] mb-3">:</span>;

  return (
    <div className={cn("flex items-end gap-1", className)}>
      {timeLeft.days > 0 && (
        <>
          <Unit value={timeLeft.days} label="días" />
          <Sep />
        </>
      )}
      <Unit value={timeLeft.hours} label="horas" />
      <Sep />
      <Unit value={timeLeft.minutes} label="min" />
      <Sep />
      <Unit value={timeLeft.seconds} label="seg" />
    </div>
  );
}
