import React from "react";

interface NftHeroGraphicProps extends React.SVGProps<SVGSVGElement> {}

const NftHeroGraphic: React.FC<NftHeroGraphicProps> = (props) => {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      {...props}
    >
      {/* Background shapes - using var(--background) might still be tricky here depending on context,
          consider making it transparent or setting explicit light/dark values if needed */}
      <rect width="100" height="100" fill="var(--background)" />
      <circle cx="20" cy="30" r="35" fill="var(--primary)" opacity="0.1" />
      <rect
        x="50"
        y="40"
        width="60"
        height="60"
        rx="10"
        fill="var(--secondary)"
        opacity="0.1"
        transform="rotate(15 50 40)"
      />

      {/* Stylized Wallet Icon */}
      <g
        stroke="var(--foreground)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      >
        <path d="M15 40 H 55 V 60 H 15 Z" fill="var(--card)" />
        <path
          d="M15 40 Q 10 40 10 45 V 55 Q 10 60 15 60"
          stroke="var(--border)"
        />
        <path
          d="M55 40 Q 60 40 60 45 V 55 Q 60 60 55 60"
          stroke="var(--border)"
        />
        <path d="M15 45 H 55" stroke="var(--border)" />
        <circle cx="48" cy="52" r="3" fill="var(--primary)" stroke="none" />
      </g>

      {/* Stylized Chart/Graph Lines */}
      <g stroke="var(--accent-foreground)" strokeWidth="1.5" opacity="0.6">
        <polyline points="30 75, 40 65, 50 70, 60 60, 70 68, 80 55, 90 60" />
        <circle cx="30" cy="75" r="1.5" fill="var(--accent-foreground)" />
        <circle cx="90" cy="60" r="1.5" fill="var(--accent-foreground)" />
      </g>

      {/* Abstract NFT Shapes */}
      <g opacity="0.7">
        <rect
          x="65"
          y="20"
          width="15"
          height="15"
          rx="3"
          fill="var(--chart-1)"
          transform="rotate(-10 65 20)"
        />
        <circle cx="85" cy="35" r="8" fill="var(--chart-3)" />
        <path d="M75 50 L 80 60 L 70 60 Z" fill="var(--chart-5)" />
      </g>
    </svg>
  );
};

export default NftHeroGraphic;
