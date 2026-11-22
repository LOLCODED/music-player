import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const native = () => Capacitor.isNativePlatform();

export function hapticSelection(): void {
  if (native()) void Haptics.selectionChanged().catch(() => {});
}

export function hapticImpact(): void {
  if (native()) void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}
