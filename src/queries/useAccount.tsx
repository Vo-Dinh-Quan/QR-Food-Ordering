import accountApiRequest from "@/apiRequests/account";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AccountResType } from "@/schemaValidations/account.schema";

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
  })
}
