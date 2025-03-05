// hooks/useSerialGenerator.ts
const useBill = () => {
  const generateHAWBCode = (index: number): string => {
    return `GX${index.toString().padStart(6, "0")}`;
  };

  return { generateHAWBCode };
};

export default useBill;
