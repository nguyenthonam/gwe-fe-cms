export interface FormatNumberViOptions {
  minFractionDigits?: number; // số chữ số lẻ tối thiểu
  maxFractionDigits?: number; // số chữ số lẻ tối đa
  suffix?: string; // đơn vị hiển thị thêm phía sau (vd: "kg", "%")
}

/**
 * Hàm CHÍNH: format mọi loại số theo chuẩn Việt Nam:
 * - Dùng Intl.NumberFormat("vi-VN")
 * - "." ngăn nghìn, "," thập phân
 * - min/maxFractionDigits có thể truyền vào để điều chỉnh
 */
export const formatNumberVi = (value: number | string | null | undefined, options: FormatNumberViOptions = {}): string => {
  if (value === null || value === undefined || value === "") return "";

  const num = Number(value);
  if (isNaN(num)) return "";

  // Làm mượt lỗi số thực (0.6000000001,...)
  const safe = Math.round(num * 1000) / 1000;

  let { minFractionDigits, maxFractionDigits } = options;
  const { suffix } = options;

  // Default: cho phép 0–2 chữ số lẻ
  if (minFractionDigits == null) minFractionDigits = 0;
  if (maxFractionDigits == null) maxFractionDigits = 2;

  // Đảm bảo hợp lệ
  if (minFractionDigits < 0) minFractionDigits = 0;
  if (maxFractionDigits < minFractionDigits) {
    maxFractionDigits = minFractionDigits;
  }

  const formatter = new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits,
  });

  const core = formatter.format(safe);
  return suffix ? `${core} ${suffix}` : core;
};

/* ====== Helper cho một số use-case phổ biến (KHÔNG bắt buộc dùng) ====== */

/** Số nguyên: không có chữ số lẻ */
export const formatIntegerVi = (value: number | string | null | undefined, suffix?: string): string =>
  formatNumberVi(value, {
    minFractionDigits: 0,
    maxFractionDigits: 0,
    suffix,
  });

/** Số lẻ 2 chữ số (giá, tỷ lệ,...) */
export const formatFixed2Vi = (value: number | string | null | undefined, suffix?: string): string =>
  formatNumberVi(value, {
    minFractionDigits: 2,
    maxFractionDigits: 2,
    suffix,
  });

/** Cân nặng: luôn 1 chữ số lẻ (0,5; 1,0; 12,3; ...) */
export const formatWeightVi = (value: number | string | null | undefined, suffix = ""): string =>
  formatNumberVi(value, {
    minFractionDigits: 1,
    maxFractionDigits: 1,
    suffix,
  });
