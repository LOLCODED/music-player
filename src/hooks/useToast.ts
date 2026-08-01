import { useCallback, useEffect, useRef, useState } from "react";
import { TOAST_DURATION_MS } from "../utils/constants";

export function useToast() {
  const [toast, setToast] = useState("");
  const timerRef = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string) => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    setToast(message);
    timerRef.current = window.setTimeout(() => setToast(""), TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { toast, showToast };
}
