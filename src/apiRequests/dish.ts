import http from "@/lib/http";
import {
  CreateDishBodyType,
  DishListResType,
  DishResType,
  UpdateDishBodyType,
} from "@/schemaValidations/dish.schema";

const prefix = "/dishes";

const dishApiRequest = {
  list: () => http.get<DishListResType>(`${prefix}/`),
  add: (body: CreateDishBodyType) => http.post<DishResType>(`${prefix}`, body),
  getDish: (id: number) => http.get<DishResType>(`${prefix}/detail/${id}`),
  updateDish: (id: number, body: UpdateDishBodyType) =>
    http.put<DishResType>(`${prefix}/detail/${id}`, body),
  deleteDish: (id: number) =>
    http.delete<DishResType>(`${prefix}/detail/${id}`),
};

export default dishApiRequest;
