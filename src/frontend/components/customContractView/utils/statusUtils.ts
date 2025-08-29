import { STATUS_CONFIGS } from "../constants";

export const formatStatus = (status: any): string => {
  const key = Object.keys(status || {})[0] || "None";
  return key === "Objected" && status?.[key] ? `${key}: ${status[key]}` : key;
};

export const getStatusConfig = (status: any) => {
  const key = Object.keys(status || {})[0] || "None";
  return (
    STATUS_CONFIGS[key as keyof typeof STATUS_CONFIGS] || STATUS_CONFIGS.None
  );
};
