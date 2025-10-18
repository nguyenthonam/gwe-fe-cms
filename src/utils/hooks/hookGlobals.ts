export const getId = (val: any): string | null => {
  if (!val) return "";
  if (typeof val === "object" && val._id) return val._id;
  if (typeof val === "string") return val;
  return null;
};

export const getNameOfObjectId = (val: any): string | null => {
  if (!val) return "";
  if (typeof val === "object" && val.name) return val.name || val._id;
  if (typeof val === "object" && val._id) return val._id;
  if (typeof val === "string") return val;
  return "";
};
