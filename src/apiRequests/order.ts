import http from "@/lib/http";
import {
	CreateDishBodyType,
	DishListResType,
	DishResType,
	UpdateDishBodyType,
} from "@/schemaValidations/dish.schema";
import { GuestGetOrdersResType } from "@/schemaValidations/guest.schema";
import {
	GetOrderDetailResType,
	GetOrdersQueryParamsType,
	UpdateOrderBodyType,
	UpdateOrderResType,
} from "@/schemaValidations/order.schema";
import queryString from "query-string";

const prefix = "/orders";

const orderApiRequest = {
	list: (queryParams: GetOrdersQueryParamsType) =>
		http.get<GuestGetOrdersResType>(
			`${prefix}?${queryString.stringify({
				fromDate: queryParams.fromDate?.toISOString(),
				toDate: queryParams.toDate?.toISOString(),
			})}`
		),
	// add: (body: CreateDishBodyType) => http.post<DishResType>(`${prefix}`, body),
	// getDish: (id: number) => http.get<DishResType>(`${prefix}/${id}`),
	updateOrder: (id: number, body: UpdateOrderBodyType) =>
		http.put<UpdateOrderResType>(`${prefix}/${id}`, body),
	// deleteDish: (id: number) => http.delete<DishResType>(`${prefix}/${id}`),
	getOrderDetail: (id: number) =>
		http.get<GetOrderDetailResType>(`${prefix}/${id}`),
};

export default orderApiRequest;
