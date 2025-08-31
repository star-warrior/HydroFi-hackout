import React from "react";
import forestBg from "../assets/forest.png";

const GlassyLayout = ({ children, showForestBg = false }) => (
  <div className="relative min-h-screen w-full flex flex-col items-center justify-center">
    {showForestBg && (
      <img
        src={forestBg}
        alt="Background"
        className="fixed inset-0 w-full h-full object-cover z-0"
        style={{ filter: "none" }}
      />
    )}
    {!showForestBg && (
      <div className="fixed inset-0 bg-gradient-to-br from-green-900/80 via-green-800/70 to-green-950/80 backdrop-blur-lg z-10" />
    )}
    <main className="relative z-20 w-full flex flex-col items-center justify-center min-h-screen">
      {children}
    </main>
  </div>
);

export default GlassyLayout;
