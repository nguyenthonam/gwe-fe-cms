import { useQuery } from "@tanstack/react-query";
import { searchOrdersApi } from "@/utils/apis/apiOrder";
import { IFilterOrder, IOrder } from "@/types/typeOrder";

/**
 * Hook lấy danh sách đơn hàng với caching, loading, error state.
 * @param filters Các điều kiện lọc đơn hàng
 */
export function useOrdersQuery(filters: IFilterOrder) {
  return useQuery<IOrder[], Error>({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const response = await searchOrdersApi(filters); // AxiosResponse<IOrder[]>
      return response.data;
    },
    // keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}
