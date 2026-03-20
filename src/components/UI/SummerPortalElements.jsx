import React, { useCallback } from "react";
import { motion, useTransform } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const Seagull = ({ className, style }) => (
  <svg
    viewBox="0 0 120 40"
    className={className}
    style={style}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M60 20 Q45 5 15 8 Q35 18 60 20"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M60 20 Q75 5 105 8 Q85 18 60 20"
      fill="currentColor"
      opacity="0.9"
    />
    <ellipse cx="60" cy="22" rx="6" ry="3" fill="currentColor" opacity="0.95" />
  </svg>
);

const Cloud = ({ className }) => (
  <svg
    viewBox="0 0 300 120"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="100" cy="80" rx="90" ry="35" opacity="0.4" />
    <ellipse cx="160" cy="55" rx="70" ry="45" opacity="0.5" />
    <ellipse cx="220" cy="75" rx="65" ry="35" opacity="0.4" />
  </svg>
);

const SunRays = () => {
  const rays = Array.from({ length: 12 });
  return (
    <motion.div
      className="absolute w-full h-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
    >
      {rays.map((_, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 origin-left"
          style={{
            width: "220px",
            height: "1px",
            background: "linear-gradient(to right, rgba(99,102,241,0.1), transparent)",
            transform: `rotate(${i * 30}deg)`,
            borderRadius: "2px",
          }}
        />
      ))}
    </motion.div>
  );
};

const OceanWave = ({ delay = 0, opacity = 0.2, bottom = 0 }) => (
  <motion.div
    className="absolute left-0 w-[200%]"
    style={{ bottom: `${bottom}px`, willChange: "transform" }}
    animate={{ x: [0, "-50%"] }}
    transition={{ duration: 20 + delay * 5, repeat: Infinity, ease: "linear" }}
  >
    <svg
      viewBox="0 0 1440 60"
      className="w-full h-12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <path
        d="M0,30 C240,10 480,50 720,30 C960,10 1200,50 1440,30"
        stroke="rgba(79,70,229,0.3)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  </motion.div>
);

const FlyingBird = ({ orbitSize, duration, delay = 0, reverse = false, size = "w-10 h-4", colorClass = "text-slate-400/20" }) => (
  <motion.div
    animate={{ rotate: reverse ? -360 : 360 }}
    transition={{ duration, repeat: Infinity, ease: "linear", delay }}
    className="absolute origin-center"
    style={{ width: orbitSize, height: orbitSize, willChange: "transform" }}
  >
    <div className="absolute top-0 left-1/2 -translate-x-1/2">
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3 + delay * 0.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Seagull
          className={`${size} ${colorClass}`}
          style={{ transform: reverse ? "scaleX(-1)" : undefined }}
        />
      </motion.div>
    </div>
  </motion.div>
);

export function SummerPortalElements({ scrollYProgress }) {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const birdOrbitScale = useTransform(scrollYProgress, [0, 0.4], [1, 6]);
  const birdOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const birdRotation = useTransform(scrollYProgress, [0, 0.6], [0, 180]);
  
  const cloudParallax = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const oceanParallax = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const sunParallax = useTransform(scrollYProgress, [0, 1], [1, 0.85]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-b from-[#1e3a5f] via-[#4a90e2] to-[#c4e9f2]">
      {/* Dynamic Sun Glow following scroll */}
      <motion.div 
        style={{ scale: sunParallax, opacity: useTransform(scrollYProgress, [0, 0.5], [0.8, 1]) }}
        className="absolute top-[10%] right-[10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px]"
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,223,100,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-32 md:h-32 rounded-full"
          style={{
            background: "radial-gradient(circle, #ffdb58 0%, #f58b05 80%, transparent 100%)",
            boxShadow: "0 0 60px rgba(245,139,5,0.4)"
          }}
        />
        <SunRays />
      </motion.div>

      <motion.div style={{ y: cloudParallax }} className="absolute inset-0">
        <Particles
          id="summer-portal-particles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false },
            particles: {
              number: { value: 30, density: { enable: true, value_area: 1000 } },
              color: { value: ["#6366F1", "#94A3B8"] },
              shape: { type: "circle" },
              opacity: { value: { min: 0.05, max: 0.2 } },
              size: { value: { min: 1, max: 3 } },
              move: {
                enable: true,
                speed: 0.2,
                direction: "top-right",
                outModes: { default: "out" },
              },
            },
            detectRetina: true,
          }}
          className="absolute inset-0"
        />
      </motion.div>

      <motion.div style={{ y: cloudParallax }} className="absolute inset-0">
        <motion.div
          animate={{ x: ["-20vw", "120vw"] }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute top-[15%]"
        >
          <Cloud className="w-80 h-32 text-slate-200/40" />
        </motion.div>

        <motion.div
          animate={{ x: ["110vw", "-30vw"] }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear", delay: 10 }}
          className="absolute top-[35%]"
        >
          <Cloud className="w-64 h-24 text-slate-100/60" />
        </motion.div>
      </motion.div>

      <motion.div 
        style={{ scale: birdOrbitScale, opacity: birdOpacity, rotate: birdRotation }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <FlyingBird orbitSize="40vw" duration={25} size="w-8 h-3" colorClass="text-indigo-400/20" />
        <FlyingBird orbitSize="55vw" duration={35} delay={5} reverse size="w-12 h-5" colorClass="text-slate-400/15" />
      </motion.div>

      <motion.div style={{ y: oceanParallax }} className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        <OceanWave delay={0} opacity={0.15} bottom={0} />
        <OceanWave delay={2} opacity={0.1} bottom={12} />
      </motion.div>

    </div>
  );
}
