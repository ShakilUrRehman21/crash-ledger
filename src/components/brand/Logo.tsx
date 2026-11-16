import Link from "next/link";

interface LogoMarkProps {
    size?: number;
    className?: string;
    /** "brand" = orange tile; "inverted" = white tile for orange backgrounds */
    tone?: "brand" | "inverted";
}

/** Brand mark: a ledger "C" with a marker dot at the point of failure. */
export function LogoMark({ size = 36, className, tone = "brand" }: LogoMarkProps) {
    const inverted = tone === "inverted";
    const glyph = "#0D0D0D";
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <rect x="1.5" y="1.5" width="37" height="37" rx="2" fill={inverted ? "#F2EFE8" : "#FF4D1A"} stroke="#0D0D0D" strokeWidth="3" />
            <path d="M25.5 13.2A9 9 0 1 0 25.5 26.8" stroke={glyph} strokeWidth="3.4" strokeLinecap="round" />
            <circle cx="27" cy="20" r="2.6" fill={glyph} />
        </svg>
    );
}

interface LogoProps {
    /** "dark" text for light backgrounds, "light" text for dark/orange backgrounds */
    variant?: "dark" | "light";
    size?: number;
    href?: string | null;
    className?: string;
    /** Override mark tone; defaults to inverted on "light" variant */
    tone?: "brand" | "inverted";
}

export function Logo({ variant = "dark", size = 36, href = "/", className = "", tone }: LogoProps) {
    const primary = variant === "light" ? "text-white" : "text-[#0D0D0D]";
    const secondary = variant === "light" ? "text-white/70" : "text-[#FF4D1A]";

    const content = (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <LogoMark size={size} tone={tone ?? (variant === "light" ? "inverted" : "brand")} />
            <span className={`font-bold uppercase tracking-[0.08em] leading-none ${primary}`} style={{ fontSize: size * 0.44, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
                Crash<span className={secondary}>Ledger</span>
            </span>
        </span>
    );

    if (href === null) return content;
    return (
        <Link href={href} aria-label="CrashLedger home">
            {content}
        </Link>
    );
}
