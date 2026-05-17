import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function PowerExhaustLogo({ className = "", size = "md", href = "/" }: LogoProps) {
  const dimensions = {
    sm: { w: 130, h: 36, iconW: 28, iconH: 28 },
    md: { w: 160, h: 44, iconW: 36, iconH: 36 },
    lg: { w: 200, h: 56, iconW: 44, iconH: 44 },
  }[size];

  const content = (
    <span className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon mark — stylized P */}
      <span
        className="flex-shrink-0 flex items-center justify-center rounded-lg bg-[#E30613]"
        style={{ width: dimensions.iconW, height: dimensions.iconH }}
      >
        <svg viewBox="0 0 24 24" fill="none" width={dimensions.iconW * 0.65} height={dimensions.iconH * 0.65}>
          {/* Diagonal slash */}
          <line x1="3" y1="20" x2="8" y2="4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          {/* P letter */}
          <path d="M8 4 h7 a5 5 0 0 1 0 10 h-7 V4z" fill="white"/>
        </svg>
      </span>
      {/* Wordmark */}
      <span className="leading-none">
        <span className="block font-black tracking-tight text-white" style={{ fontSize: dimensions.iconH * 0.38, lineHeight: 1.1 }}>
          POWER-
        </span>
        <span className="block font-black tracking-tight text-[#E30613]" style={{ fontSize: dimensions.iconH * 0.38, lineHeight: 1.1 }}>
          EXHAUST
        </span>
      </span>
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

// Also export an image-based version for og/favicon use
export function PowerExhaustLogoImage({ width = 160, height = 44, className = "" }: { width?: number; height?: number; className?: string }) {
  return (
    <Image
      src="/logo-power-exhaust.svg"
      alt="Power Exhaust"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
