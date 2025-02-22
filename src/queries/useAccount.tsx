import accountApiRequest from "@/apiRequests/account"
import { useQuery } from "@tanstack/react-query"

export const useAccountProfile = () => {
  return useQuery({
    queryKey: ["account-profile"],
    queryFn: accountApiRequest.me
  })
}

/*
trong trường hợp cần sử dụng hàm onSuccess (sau khi get thành công thì sẽ làm gì đó ) thì sẽ như sau:

import accountApiRequest from "@/apiRequests/account";
import { AccountResType } from "@/schemaValidations/account.schema";
import { useQuery } from "@tanstack/react-query";

export const useAccountProfile = (onSuccess?: (data: AccountResType) => void) => {
  return useQuery({
    queryKey: ['account-profile', onSuccess],
    queryFn: async () => {
      const res = await accountApiRequest.me();
      if (onSuccess) {
        onSuccess(res.payload);
      }
      return res;
    }
  });
};
*/