import accountApiRequest from "@/apiRequests/account"
import { useQuery } from "@tanstack/react-query"
import { AccountResType } from "@/schemaValidations/account.schema";

export const useAccountProfile = () => {
  return useQuery({
    queryKey: ["account-profile"],
    queryFn: accountApiRequest.me
  })
}
// trong trường hợp cần sử dụng hàm onSuccess (sau khi get thành công thì sẽ làm gì đó ) thì sẽ như sau:
// giải thích logic cú pháp này là useAccountProfile là 1 hàm nhận vào 1 hàm callback onSuccess (hàm onSuccess này sẽ nhận vào 1 tham số là data kiểu AccountResType và không trả về gì cả).
// export const useAccountProfile1 = (onSuccess?: (data: AccountResType) => void) => {
//   return useQuery({
//     queryKey: ['account-profile', onSuccess],
//     queryFn: async () => {
//       const res = await accountApiRequest.me();
//       if (onSuccess) {
//         onSuccess(res.payload);
//       }
//       return res;
//     }
//   });
// };