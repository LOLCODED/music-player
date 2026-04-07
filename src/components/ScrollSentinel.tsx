import React, { useEffect, useRef } from "react";

interface Props {
  onVisible: () => void;
  hasMore: boolean;
  loading?: boolean;
  itemCount: number;
}

const ScrollSentinel: React.FC<Props> = ({ onVisible, hasMore, loading, itemCount }) => {
  const ref = useRef<HTMLDivElement>(null);
  const onVisibleRef = useRef(onVisible);
  useEffect(() => { onVisibleRef.current = onVisible; });

  useEffect(() => {
    if (!hasMore || loading || !ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onVisibleRef.current(); },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // Re-observe after each batch so we fire again if sentinel is still visible
  }, [hasMore, loading, itemCount]);

  if (!hasMore) return null;

  return (
    <div ref={ref} style={{ display: "flex", justifyContent: "center", padding: 16 }}>
      {loading && <div className="spinner" />}
    </div>
  );
};

export default ScrollSentinel;
