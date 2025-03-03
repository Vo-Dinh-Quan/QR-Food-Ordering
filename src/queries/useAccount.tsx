import accountApiRequest from "@/apiRequests/account";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AccountResType,
  UpdateEmployeeAccountBodyType,
} from "@/schemaValidations/account.schema";

export const useAccountMe = () => {
  return useQuery({
    queryKey: ["account-profile"],
    queryFn: accountApiRequest.me,
  });
};

export const useUpdateMeMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.updateMe,
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.changePassword,
  });
};

export const useGetAccountList = () => {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: accountApiRequest.list,
  });
};

export const useGetAccount = ({ id, enable }: { id: number, enable: boolean }) => {
  return useQuery({
    queryKey: ["account", id],
    queryFn: () => accountApiRequest.getEmployee(id),
    enabled: enable
  });
};

export const useAddAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountApiRequest.addEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
};

export const useUpdateAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // nhận vào 1 đối tượng có kiểu dữ liệu là UpdateEmployeeAccountBodyType và có thêm id
    // cú pháp {id,...body} để lấy ra id và còn lại là body
    mutationFn: ({id,...body}: UpdateEmployeeAccountBodyType & { id: number }) =>
      accountApiRequest.updateEmployee(id, body),
    onSuccess: (_, { id }) => {
      // _ là kết quả của mutationFn, không sử dụng trong trường hợp này
      // { id } là đối tượng chứa các tham số mà bạn đã truyền vào mutationFn
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["account", id],
      });
    },
  });
};

export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:  accountApiRequest.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
}
