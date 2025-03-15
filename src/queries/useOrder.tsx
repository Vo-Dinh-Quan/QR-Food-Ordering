import orderApiRequest from "@/apiRequests/order";
import { UpdateOrderBodyType } from "@/schemaValidations/order.schema";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUpdateOrderMutation = () => {
	return useMutation({ // note: mutationFn là một hàm không thể nhận vào 2 tham số. Nếu muốn truyền vào nhiều tham số thì phải truyền vào dưới dạng object (chat GPT)
		mutationFn: ({ id, ...body }: UpdateOrderBodyType & { id: number }) =>
			orderApiRequest.updateOrder(id, body),
	});
};

export const useGetOrderList = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: orderApiRequest.list,
  });
}