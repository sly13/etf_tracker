"use client";

interface FundLogoProps {
  src: string;
  alt: string;
  className?: string;
}

export default function FundLogo({ src, alt, className = "" }: FundLogoProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={e => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
