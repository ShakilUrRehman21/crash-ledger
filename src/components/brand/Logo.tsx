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
    const glyph = inverted ? "#F04A1A" : "#fff";
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
            <defs>
                <linearGradient id="cl-mark-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF7A3D" />
                    <stop offset="1" stopColor="#F04A1A" />
                </linearGradient>
            </defs>
            <rect width="40" height="40" rx="11" fill={inverted ? "#fff" : "url(#cl-mark-grad)"} />
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
    const primary = variant === "light" ? "text-white" : "text-[#111827]";
    const secondary = variant === "light" ? "text-white/70" : "text-[#FA5A2A]";

    const content = (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <LogoMark size={size} tone={tone ?? (variant === "light" ? "inverted" : "brand")} />
            <span className={`font-heading font-extrabold tracking-tight leading-none ${primary}`} style={{ fontSize: size * 0.56 }}>
                Crash<span className={`font-semibold ${secondary}`}>Ledger</span>
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
