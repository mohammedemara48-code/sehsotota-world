import type { CSSProperties } from "react";

export function SkyDecor({ rainbow = false }: { rainbow?: boolean }) {
  return (
    <>
      <div className="absolute inset-0 bg-sky" />
      <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-sky-dusk to-transparent" />
      <Sun />
      {rainbow ? <Rainbow /> : null}
      <Cloud className="drift top-[8%] left-[-20%] w-36 opacity-90" />
      <Cloud className="drift-alt top-[16%] left-[-40%] w-28 opacity-80" />
      <Cloud className="drift top-[22%] left-[-10%] w-24 opacity-70" style={{ animationDelay: "-8s" }} />
      <Birds />
    </>
  );
}

function Sun() {
  return (
    <div className="bob absolute top-[4%] right-[8%] w-[18vmin] min-w-20 max-w-36">
      <svg viewBox="0 0 120 120" className="overflow-visible" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x="56"
            y="4"
            width="8"
            height="22"
            rx="4"
            fill="#ffd166"
            transform={`rotate(${i * 45} 60 60)`}
          />
        ))}
        <circle cx="60" cy="60" r="28" fill="#ffd166" />
        <circle cx="50" cy="56" r="4" fill="#3e2f2f" />
        <circle cx="70" cy="56" r="4" fill="#3e2f2f" />
        <path d="M48 70 Q60 80 72 70" fill="none" stroke="#3e2f2f" strokeWidth="3" strokeLinecap="round" />
        <circle cx="44" cy="66" r="5" fill="#ff8ba0" opacity="0.7" />
        <circle cx="76" cy="66" r="5" fill="#ff8ba0" opacity="0.7" />
      </svg>
    </div>
  );
}

function Cloud({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 140 70" className={`absolute ${className ?? ""}`} style={style} aria-hidden="true">
      <ellipse cx="44" cy="42" rx="28" ry="20" fill="#fff" />
      <ellipse cx="74" cy="30" rx="32" ry="24" fill="#fff" />
      <ellipse cx="106" cy="42" rx="26" ry="18" fill="#fff" />
      <rect x="20" y="40" width="100" height="22" rx="11" fill="#fff" />
    </svg>
  );
}

function Rainbow() {
  return (
    <svg
      viewBox="0 0 400 160"
      className="pointer-events-none absolute top-[6%] left-1/2 w-[70%] max-w-xl -translate-x-1/2 opacity-80"
      aria-hidden="true"
    >
      {["#ff6b6b", "#ff9f43", "#ffd166", "#7ed957", "#4d96ff", "#9b6dff"].map((c, i) => (
        <path
          key={c}
          d="M20 150 Q200 10 380 150"
          fill="none"
          stroke={c}
          strokeWidth={14}
          strokeLinecap="round"
          transform={`translate(0 ${i * 8})`}
          opacity={0.85}
        />
      ))}
    </svg>
  );
}

function Birds() {
  return (
    <svg viewBox="0 0 80 30" className="fly absolute top-[18%] left-0 w-16" aria-hidden="true">
      <path d="M8 18 Q18 8 28 18" fill="none" stroke="#3e2f2f" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 12 Q54 2 64 12" fill="none" stroke="#3e2f2f" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Hills() {
  return (
    <>
      <div className="hill bottom-[18%] h-[34%] bg-grass-light" />
      <div className="hill bottom-[8%] h-[28%] bg-grass" />
      <div className="absolute inset-x-0 bottom-0 h-[14%] bg-grass-deep" />
      <Flowers />
    </>
  );
}

function Flowers() {
  const spots = [
    { left: "6%", color: "#ff8ba0" },
    { left: "14%", color: "#ffd166" },
    { left: "78%", color: "#4d96ff" },
    { left: "88%", color: "#ff6b6b" },
    { left: "40%", color: "#fff6e5" },
  ];
  return (
    <div className="absolute inset-x-0 bottom-[6%] h-16">
      {spots.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 24 36"
          className="sway absolute bottom-0 w-7"
          style={{ left: s.left, animationDelay: `${i * 0.2}s` }}
          aria-hidden="true"
        >
          <rect x="11" y="16" width="2.4" height="20" fill="#3d9a4a" />
          <circle cx="12" cy="12" r="5" fill={s.color} />
          <circle cx="7" cy="14" r="4" fill={s.color} />
          <circle cx="17" cy="14" r="4" fill={s.color} />
          <circle cx="12" cy="14" r="3" fill="#ffd166" />
        </svg>
      ))}
    </div>
  );
}
