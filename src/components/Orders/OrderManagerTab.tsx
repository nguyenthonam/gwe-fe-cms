"use client";

import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { useQuery } from "@tanstack/react-query";

export default function OrderManagerTab() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await getCarriersApi();
      if (!res) throw new Error("Lỗi khi fetch đơn hàng");
      return res.data.data; // Giả sử API trả về danh sách đơn hàng trong data.data);
    },
  });

  if (isLoading) return <div>Đang tải đơn hàng...</div>;
  if (error) return <div>Lỗi: {(error as Error).message}</div>;

  return (
    <div className="mt-4 space-y-2">
      {data.map((order: any) => (
        <div key={order.id} className="border p-2 rounded">
          #{order.code} — {order.status}
        </div>
      ))}
    </div>
  );
}
