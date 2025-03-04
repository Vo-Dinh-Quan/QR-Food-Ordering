import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AccountResType,
  UpdateEmployeeAccountBodyType,
} from "@/schemaValidations/account.schema";
import dishApiRequest from "@/apiRequests/dish";
import { UpdateDishBodyType } from "@/schemaValidations/dish.schema";

export const useDishListQuery = () => {
  return useQuery({
    queryKey: ["dishes"],
    queryFn: dishApiRequest.list,
  });
};

export const useGetDish = ({ id, enable }: { id: number, enable: boolean }) => {
  return useQuery({
    queryKey: ["dishes", id],
    queryFn: () => dishApiRequest.getDish(id),
    enabled: enable
  });
};

export const useAddDishMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dishApiRequest.add,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dishes"],
      });
    },
  });
};

export const useUpdateDishMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // nhận vào 1 đối tượng có kiểu dữ liệu là UpdateEmployeeAccountBodyType và có thêm id
    // cú pháp {id,...body} để lấy ra id và còn lại là body
    mutationFn: ({id,...body}: UpdateDishBodyType & { id: number }) =>
      dishApiRequest.updateDish(id, body),
    onSuccess: (_, { id }) => {
      // _ là kết quả của mutationFn, không sử dụng trong trường hợp này
      // { id } là đối tượng chứa các tham số mà bạn đã truyền vào mutationFn
      queryClient.invalidateQueries({
        queryKey: ["dishes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dishes", id],
      });
    },
  });
};

export const useDeleteDishMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:  dishApiRequest.deleteDish,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dishes"],
      });
    },
  });
}
