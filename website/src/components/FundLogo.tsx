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
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain",
      }}
      onError={e => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
