import { ECURRENCY } from "@/types/typeGlobals";

export function formatCurrency(value: number | null, currency: ECURRENCY = ECURRENCY.VND): string {
  // const roundedValue =
  //   currency === ECURRENCY.VND
  //     ? Math.round(value) // làm tròn VND
  //     : Math.round(value * 100) / 100; // làm tròn 2 chữ số

  const formatted = new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: currency === ECURRENCY.VND ? 0 : 2,
    maximumFractionDigits: currency === ECURRENCY.VND ? 0 : 2,
  }).format(value || 0);

  return `${formatted}`;
}
