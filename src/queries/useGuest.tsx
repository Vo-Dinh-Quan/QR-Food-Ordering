import guestApiRequest from "@/apiRequests/guest";
import { useMutation } from "@tanstack/react-query";

export const useGuestLoginMutation = () => {
  return useMutation({
    mutationFn: guestApiRequest.cLogin,
    // mutationFn:(body: LoginBodyType) => authApiRequest.cLogin(body)
  });
};

export const useGuestLogoutMutation = () => {
  return useMutation({
    mutationFn: guestApiRequest.cLogout,
  });
};
