import { BLUE_SHADES } from "../../constants/ui";

/**
 * Deterministically maps a string to one of the app's blue shades
 * so the same student always gets the same accent colour without
 * storing it explicitly.
 *
 * @param {string | null | undefined} value
 * @returns {string} Hex colour string
 */
function resolveAccentColor(value) {
  if (!value) return BLUE_SHADES[0];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BLUE_SHADES[Math.abs(hash) % BLUE_SHADES.length];
}

/** Size presets: Tailwind classes for width, height, and initial font size. */
const SIZE_CLASSES = {
  sm: "w-14 h-14 text-xl",
  md: "w-20 h-20 text-3xl",
  lg: "w-28 h-28 text-5xl",
  xl: "w-40 h-40 text-6xl",
};

/**
 * Avatar — circular (rounded square) student picture or initial letter.
 *
 * @param {{
 *   name: string,
 *   accent?: string,
 *   image?: string,
 *   size?: 'sm' | 'md' | 'lg' | 'xl',
 * }} props
 */
export function Avatar({ name, accent, image, size = "md" }) {
  const sz = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const color = resolveAccentColor(accent || name);

  return (
    <div className="relative group shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95">
      {/* Hover glow halo */}
      <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div
        className={`${sz} rounded-3xl flex items-center justify-center font-black overflow-hidden relative z-10 shadow-2xl transition-all duration-300 border-2 border-white/10 group-hover:border-sky-400/50 group-hover:rounded-[2rem]`}
        style={{
          background: image
            ? "var(--color-tech-surface)"
            : `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`,
          color,
        }}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <span className="drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]">
            {name?.[0]?.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
