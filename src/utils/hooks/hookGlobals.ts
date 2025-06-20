export const getId = (val: any): string => {
  if (!val) return "";
  if (typeof val === "object" && val._id) return val.name || val._id;
  if (typeof val === "string") return val;
  return "";
};
