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
