import orderApiRequest from "@/apiRequests/order";
import {
	GetOrdersQueryParamsType,
	PayGuestOrdersBodyType,
	UpdateOrderBodyType,
} from "@/schemaValidations/order.schema";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUpdateOrderMutation = () => {
	return useMutation({
		// note: mutationFn là một hàm không thể nhận vào 2 tham số. Nếu muốn truyền vào nhiều tham số thì phải truyền vào dưới dạng object (chat GPT)
		mutationFn: ({
			orderId,
			...body
		}: UpdateOrderBodyType & { orderId: number }) =>
			orderApiRequest.updateOrder(orderId, body),
	});
	// ở đây ta không dùng queryClient để invalidate vì ta đã xử lý fetch lại với socket.io rồi
};

export const useGetOrderList = (queryParams: GetOrdersQueryParamsType) => {
	return useQuery({
		queryKey: ["orders", queryParams],
		queryFn: () => orderApiRequest.list(queryParams),
	});
};

export const useGetOrderDetail = ({
	id,
	enabled,
}: {
	id: number;
	enabled: boolean;
}) => {
	return useQuery({
		queryKey: ["order", id],
		queryFn: () => orderApiRequest.getOrderDetail(id),
		enabled,
	});
};

export const usePayForGuestMutation = () => {
	return useMutation({
		mutationFn: (body: PayGuestOrdersBodyType) =>
			orderApiRequest.payGuest(body),
	});
};

export const useCreateOrderMutation = () => {
	return useMutation({
		mutationFn: orderApiRequest.createOrders,
	});
};
