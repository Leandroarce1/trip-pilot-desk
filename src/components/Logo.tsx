import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
}

/**
 * FlowDestinos brand logo.
 * - light: for white/sand backgrounds (navy + primary blue)
 * - dark:  for navy backgrounds (white + sky)
 */
export function Logo({ variant = "light", showTagline = true, className }: LogoProps) {
  const isDark = variant === "dark";

  // Brand colors (literal hex used inside SVG by design — these are the brand mark)
  const iconStroke = isDark ? "#5BB8F5" : "#1A7FBA";
  const iconDot = isDark ? "#FFFFFF" : "#0B1F3A";
  const iconRing = isDark ? "#5BB8F5" : "#1A7FBA";

  const flowColor = isDark ? "#FFFFFF" : "#0B1F3A";
  const destinosColor = isDark ? "#5BB8F5" : "#1A7FBA";
  const taglineColor = isDark ? "#5BB8F5" : "#8BAFC8";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="18" cy="18" r="16.5" stroke={iconRing} strokeWidth="1.5" opacity="0.9" />
        {/* Fluid flight route */}
        <path
          d="M7 22 C 12 14, 20 14, 26 11"
          stroke={iconStroke}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Origin spark */}
        <circle cx="7" cy="22" r="1.6" fill={iconStroke} />
        {/* Destination point */}
        <circle cx="26" cy="11" r="2.6" fill={iconDot} />
        <circle cx="26" cy="11" r="4.2" stroke={iconDot} strokeWidth="1" opacity="0.35" fill="none" />
      </svg>

      <div className="flex flex-col leading-none">
        <div
          className="text-[17px] tracking-tight"
          style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}
        >
          <span style={{ color: flowColor, fontWeight: 700 }}>Flow</span>
          <span style={{ color: destinosColor, fontWeight: 300 }}>Destinos</span>
        </div>
        {showTagline && (
          <span
            className="mt-1"
            style={{
              color: taglineColor,
              fontSize: "9px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Agência de Viagens
          </span>
        )}
      </div>
    </div>
  );
}
