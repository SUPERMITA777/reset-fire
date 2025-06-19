"use client";
import { useEffect, useState } from "react";

export function BackgroundWrapper({ children }: { children: React.ReactNode }) {
  const [bg, setBg] = useState<string>("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("backgroundTexture");
      setBg(saved || "/nudetexture.png");
    }
  }, []);
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url('${bg}')`,
        backgroundSize: "cover",
        backgroundRepeat: "repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {children}
    </div>
  );
} 