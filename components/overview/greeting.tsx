"use client";

import { useEffect, useState } from "react";

export interface GreetingLabels {
  night: string;
  morning: string;
  day: string;
  evening: string;
  yogi: string;
}

function greetingFor(hour: number, labels: GreetingLabels): string {
  if (hour < 6) return labels.night;
  if (hour < 12) return labels.morning;
  if (hour < 18) return labels.day;
  return labels.evening;
}

export function Greeting({ userName, labels }: { userName: string | null; labels: GreetingLabels }) {
  const [greeting, setGreeting] = useState(() => greetingFor(new Date().getHours(), labels));

  useEffect(() => {
    const id = setInterval(() => {
      const g = greetingFor(new Date().getHours(), labels);
      setGreeting((prev) => (prev === g ? prev : g));
    }, 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <p className="text-xl font-semibold tracking-tight">
      {greeting}, {userName || labels.yogi}
    </p>
  );
}