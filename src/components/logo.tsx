/**
 * MiitroLogo
 *
 * Wordmark: M  [ii-as-pins svg]  tro
 *
 * The "ii" is an inline SVG of two stylised letter-i shapes where:
 *   • the tittle (dot) is a prominent filled circle  → pin head
 *   • the stem tapers to a sharp downward point      → pin tip
 * This makes each character read simultaneously as the letter "i"
 * and as a minimal map-pin, while blending cleanly into the typeface.
 *
 * The Shield badge sits to the left of the wordmark, matching the
 * original brand treatment.
 */

import { Shield } from "lucide-react";

interface MiitroLogoProps {
  /** "default" = dark text on light bg (navbar); "dark" = white text on dark bg (footer) */
  variant?: "default" | "dark";
  /** Tailwind font-size class. Defaults to "text-2xl". */
  size?: string;
}

export function MiitroLogo({ variant = "default", size = "text-2xl" }: MiitroLogoProps) {
  const textColor = variant === "dark" ? "text-white" : "text-foreground";

  return (
    <span className={`flex items-center gap-3 font-display font-bold tracking-tight leading-none select-none ${size} ${textColor}`}>
      {/* ── Shield badge ── */}
      <span className="bg-primary p-2 rounded-lg shrink-0">
        <Shield className="w-5 h-5 text-white" />
      </span>

      {/* ── Wordmark: M [ii] tro ── */}
      <span className="flex items-center gap-0">
        <span>M</span>
        <PinPair />
        <span>tro</span>
      </span>
    </span>
  );
}

/**
 * Two "i" characters drawn as map pins.
 *
 * viewBox "0 0 22 30"  (22 wide, 30 tall)
 * Pin 1 centred at x = 5.5
 * Pin 2 centred at x = 16.5   (11px apart — matches tight "ii" tracking)
 *
 * Each pin:
 *   dot   → filled circle r=3.5  at (x, 4.5)   ← tittle / pin head
 *   stem  → filled path           from y=9.5
 *             top edge  full-width  (x±2.8)
 *             widens slightly to shoulder (x±3) at y≈16
 *             then tapers to a point at (x, 29)  ← pin tip
 *
 * The gap between dot and stem (y 8–9.5) mirrors the counter of a real "i".
 * height="0.9em" + verticalAlign keeps the glyph on the cap-height baseline.
 */
function PinPair() {
  const pin = (cx: number) => {
    const tip = cx;          // x of bottom tip
    const dotR = 3.5;
    const dotCy = 4.5;
    const stemTop = 9.5;     // top of stem (gap below dot)
    const stemHalfW = 2.8;   // half-width at top of stem
    const shoulder = 3.2;    // half-width at widest shoulder
    const shoulderY = 16;    // y of widest point
    const tipY = 29;         // y of bottom point

    return (
      <g key={cx} fill="currentColor">
        {/* pin head / tittle */}
        <circle cx={cx} cy={dotCy} r={dotR} />

        {/* pin stem — tapers from shoulder down to a point */}
        <path
          d={[
            `M ${cx - stemHalfW},${stemTop}`,
            `L ${cx + stemHalfW},${stemTop}`,
            `L ${cx + shoulder},${shoulderY}`,
            `L ${tip},${tipY}`,
            `L ${cx - shoulder},${shoulderY}`,
            "Z",
          ].join(" ")}
        />
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 22 30"
      aria-label="ii"
      role="img"
      className="inline-block text-primary shrink-0"
      style={{
        height: "0.82em",
        width: "auto",
        /* nudge down so the dot sits at cap-height, tip reaches baseline */
        verticalAlign: "-0.04em",
        /* tighten spacing against M and t */
        margin: "0 0.02em",
      }}
    >
      {pin(5.5)}
      {pin(16.5)}
    </svg>
  );
}
