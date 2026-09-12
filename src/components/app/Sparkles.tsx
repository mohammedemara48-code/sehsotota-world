import { useEffect, useState, type CSSProperties } from "react";
import { uid } from "@/lib/utils";

type Burst = { id: string; x: number; y: number };

export function useSparkles() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const spawn = (x: number, y: number) => {
    const id = uid();
    setBursts((b) => [...b, { id, x, y }]);
    window.setTimeout(() => {
      setBursts((b) => b.filter((i) => i.id !== id));
    }, 750);
  };
  return { bursts, spawn };
}

export function SparkleLayer({ bursts }: { bursts: Burst[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {bursts.map((b) => (
        <StarBurst key={b.id} x={b.x} y={b.y} />
      ))}
    </div>
  );
}

function StarBurst({ x, y }: { x: number; y: number }) {
  const rays = [
    [0, -54],
    [40, -28],
    [48, 12],
    [18, 46],
    [-22, 44],
    [-50, 8],
    [-38, -30],
    [8, -8],
  ];
  return (
    <div className="star-burst absolute" style={{ left: x, top: y }}>
      {rays.map(([dx, dy], i) => (
        <span key={i} style={{ "--dx": `${dx}px`, "--dy": `${dy}px` } as CSSProperties}>
          <svg width="18" height="18" viewBox="0 0 20 20">
            <polygon
              points="10,1 12,7 19,7.5 13.5,12 15.5,19 10,15 4.5,19 6.5,12 1,7.5 8,7"
              fill={i % 2 ? "#ffd166" : "#fff6e5"}
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

export function useTimeout(ms: number, on: boolean) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!on) {
      setDone(false);
      return;
    }
    const t = window.setTimeout(() => setDone(true), ms);
    return () => window.clearTimeout(t);
  }, [ms, on]);
  return done;
}
