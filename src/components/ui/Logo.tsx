import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function PowerExhaustLogo({ className = "", size = "md", href = "/" }: LogoProps) {
  const fontSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
  }[size];

  const content = (
    <span className={`flex items-center ${className}`}>
      <span className={`font-display font-extrabold uppercase tracking-tight leading-none ${fontSizes}`}>
        <span className="text-white">Power</span><span className="text-exhaust-orange">Exhaust</span>
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
