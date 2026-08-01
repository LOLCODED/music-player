import React from "react";
import { DEFAULT_ALBUM_ART } from "../utils/defaultArt";

interface DetailHeroProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  metaLines: string[];
  actions: React.ReactNode;
}

const DetailHero: React.FC<DetailHeroProps> = ({
  imageUrl,
  title,
  subtitle,
  metaLines,
  actions,
}) => (
  <div className="detail-hero">
    <img
      className="detail-hero-art"
      src={imageUrl}
      alt={title}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        (e.target as HTMLImageElement).src = DEFAULT_ALBUM_ART;
      }}
    />
    <div className="detail-hero-body">
      <div className="detail-hero-title">{title}</div>
      {subtitle && <div className="detail-hero-subtitle">{subtitle}</div>}
      {metaLines.filter(Boolean).map((line) => (
        <div key={line} className="detail-hero-meta">
          {line}
        </div>
      ))}
      <div className="detail-hero-actions">{actions}</div>
    </div>
  </div>
);

export default DetailHero;
