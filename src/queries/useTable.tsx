import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import tableApiRequest from "@/apiRequests/table";
import { UpdateTableBodyType } from "@/schemaValidations/table.schema";

export const useTableListQuery = () => {
  return useQuery({
    queryKey: ["tables"],
    queryFn: tableApiRequest.list,
  });
};

export const useGetTable = ({ id, enable }: { id: number, enable: boolean }) => {
  return useQuery({
    queryKey: ["tables", id],
    queryFn: () => tableApiRequest.getTable(id),
    enabled: enable
  });
};

export const useAddTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tableApiRequest.add,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tables"],
      });
    },
  });
};

export const useUpdateTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // nhận vào 1 đối tượng có kiểu dữ liệu là UpdateEmployeeAccountBodyType và có thêm id
    // cú pháp {id,...body} để lấy ra id và còn lại là body
    mutationFn: ({id,...body}: UpdateTableBodyType & { id: number }) =>
      tableApiRequest.updateTable(id, body),
    onSuccess: (_, { id }) => {
      // _ là kết quả của mutationFn, không sử dụng trong trường hợp này
      // { id } là đối tượng chứa các tham số mà bạn đã truyền vào mutationFn
      queryClient.invalidateQueries({
        queryKey: ["tables"],
      });
      queryClient.invalidateQueries({
        queryKey: ["tables", id],
      });
    },
  });
};

export const useDeleteTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:  tableApiRequest.deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tables"],
      });
    },
  });
}
