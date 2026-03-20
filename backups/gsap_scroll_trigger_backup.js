// GSAP PortalDive ScrollTrigger Animation Backup

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ... inside PortalDive component ...

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: portalSectionRef.current,
            start: "top top",
            end: "+=4000",
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
            pinSpacing: true,
          },
        });

        tl.addLabel("start", 0)
          .addLabel("mid", 0.4)
          .addLabel("interactive", 0.9);

        // 1. Text fades out and floats up
        tl.to(
          portalTextRef.current,
          {
            opacity: 0,
            y: -150,
            duration: 0.1,
          },
          "start",
        );

        // 2. The "Window" expands
        tl.fromTo(
          portalContentRef.current,
          {
            clipPath: "inset(35% 35% 35% 35% round 5rem)",
            opacity: 0.5,
          },
          {
            clipPath: "inset(0% 0% 0% 0% round 0rem)",
            opacity: 1,
            duration: 1,
            ease: "power2.inOut",
          },
          "start",
        );

        // 3. Summer content begins to reveal more clearly at mid
        tl.to(
          portalContentRef.current.querySelector("#summer-hero"),
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
          },
          "mid",
        );

        tl.set(portalContentRef.current, { pointerEvents: "auto" }, "interactive");

        ScrollTrigger.refresh();
      }, portalSectionRef);

      return () => ctx.revert();
