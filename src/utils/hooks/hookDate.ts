export const getMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const pad = (n: number) => n.toString().padStart(2, "0");

  const firstDay = `${year}-${pad(month + 1)}-01`;
  const last = new Date(year, month + 1, 0);
  const lastDay = `${year}-${pad(month + 1)}-${pad(last.getDate())}`;

  return { start: firstDay, end: lastDay };
};

export const getCurrentDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0"); // Thêm 0 nếu cần
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Thêm 0 nếu cần
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDate = (date: string | number | Date): string => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default {
  getCurrentDate,
  formatDate,
};
