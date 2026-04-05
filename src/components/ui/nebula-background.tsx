"use client";

import { useThemeStore } from "@/lib/stores/theme-store";

export function NebulaBackground() {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === "light";

  return (
    <div className="fixed inset-0 pointer-events-none z-0 gpu" aria-hidden>
      {isLight ? (
        <>
          {/* Light mode — nebula still visible underneath a frosted overlay */}
          <div className="absolute inset-0 bg-[#f5f5f7]" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "url('/nebula-1.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center top",
              backgroundRepeat: "no-repeat",
              mixBlendMode: "multiply",
            }}
          />
          <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full bg-violet-300/[0.18] blur-[80px]" />
          <div className="absolute bottom-[-150px] right-[-50px] w-[500px] h-[500px] rounded-full bg-cyan-300/[0.12] blur-[80px]" />
        </>
      ) : (
        <>
          {/* Dark mode — vibrant nebula */}
          <div
            className="absolute inset-0 opacity-[0.45]"
            style={{
              backgroundImage: "url('/nebula-1.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center top",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/40 via-[#050508]/60 to-[#050508]/90" />
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 40% 30%, transparent 20%, #050508 75%)",
              opacity: 0.5,
            }}
          />
          <div className="absolute top-[-200px] left-[-200px] w-[800px] h-[800px] rounded-full bg-violet-600/[0.08] blur-[64px]" />
          <div className="absolute bottom-[-200px] right-[-100px] w-[700px] h-[600px] rounded-full bg-cyan-500/[0.06] blur-[64px]" />
        </>
      )}
    </div>
  );
}
