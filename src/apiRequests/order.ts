import http from "@/lib/http";
import {
  CreateDishBodyType,
  DishListResType,
  DishResType,
  UpdateDishBodyType,
} from "@/schemaValidations/dish.schema";
import { GuestGetOrdersResType } from "@/schemaValidations/guest.schema";
import { UpdateOrderBodyType, UpdateOrderResType } from "@/schemaValidations/order.schema";

const prefix = "/orders";

const orderApiRequest = {
  list: () => http.get<GuestGetOrdersResType>(`${prefix}/`),
  // add: (body: CreateDishBodyType) => http.post<DishResType>(`${prefix}`, body),
  // getDish: (id: number) => http.get<DishResType>(`${prefix}/${id}`),
  updateOrder: (id: number, body: UpdateOrderBodyType) =>
    http.put<UpdateOrderResType>(`${prefix}/${id}`, body),
  // deleteDish: (id: number) => http.delete<DishResType>(`${prefix}/${id}`),
};

export default orderApiRequest;
