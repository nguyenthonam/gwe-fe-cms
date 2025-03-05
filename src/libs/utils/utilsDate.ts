const utilsDate = () => {
  const getCurrentDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0"); // Thêm 0 nếu cần
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Thêm 0 nếu cần
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  };
  return { getCurrentDate };
};

export default utilsDate;
