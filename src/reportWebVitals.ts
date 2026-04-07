// Optional web vitals reporting (no-op by default to avoid dependency/version issues)
type ReportHandler = (metric: unknown) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (!onPerfEntry) return;
  // Attempt to load web-vitals if available and use v3 API; silently ignore if not
  import("web-vitals")
    .then((mod: any) => {
      const onCLS = mod.onCLS || mod.getCLS;
      const onFID = mod.onFID || mod.getFID;
      const onFCP = mod.onFCP || mod.getFCP;
      const onLCP = mod.onLCP || mod.getLCP;
      const onTTFB = mod.onTTFB || mod.getTTFB;
      if (onCLS) onCLS(onPerfEntry);
      if (onFID) onFID(onPerfEntry);
      if (onFCP) onFCP(onPerfEntry);
      if (onLCP) onLCP(onPerfEntry);
      if (onTTFB) onTTFB(onPerfEntry);
    })
    .catch(() => {});
};

export default reportWebVitals;
