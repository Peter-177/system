import { useState, useEffect } from "react";

/**
 * Detects whether the page has been scrolled past a threshold.
 * Uses a passive event listener so it never blocks scrolling.
 *
 * @param {number} [threshold=40] - Pixel offset that triggers the "scrolled" state
 * @returns {boolean} `true` when `window.scrollY > threshold`
 */
export function useNavbarScroll(threshold = 40) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > threshold);

    // Passive: the handler never calls preventDefault, so the browser can
    // optimize the scroll event without waiting for JS to finish.
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolled;
}
