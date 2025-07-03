const utilsBill = () => {
  const generateHAWBCode = (index: number): string => {
    return `GX${index.toString().padStart(6, "0")}`;
  };

  return { generateHAWBCode };
};

export const calculateVolumeWeight = (length: number, width: number, height: number, volWeightRate: number): number => {
  if (isNaN(length) || isNaN(width) || isNaN(height)) {
    throw new Error("Kích thước kiện hàng không đúng!");
  }

  const rawWeight = (length * width * height) / volWeightRate;
  const intPart = Math.floor(rawWeight);
  const decimalPart = rawWeight - intPart;

  let roundedWeight: number;

  if (decimalPart === 0) {
    roundedWeight = rawWeight; // giữ nguyên số nguyên
  } else if (decimalPart < 0.5) {
    roundedWeight = intPart + 0.5;
  } else if (decimalPart === 0.5) {
    roundedWeight = rawWeight; // giữ nguyên 0.5
  } else {
    roundedWeight = intPart + 1;
  }

  return parseFloat(roundedWeight.toFixed(1));
};

export default utilsBill;
