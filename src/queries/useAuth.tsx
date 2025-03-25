import authApiRequest from "@/apiRequests/auth";
import { useMutation } from "@tanstack/react-query";

export const useLoginMutation = () => {
	return useMutation({
		mutationFn: authApiRequest.cLogin,
		// mutationFn:(body: LoginBodyType) => authApiRequest.cLogin(body)
	});
};

export const useLogoutMutation = () => {
	return useMutation({
		mutationFn: authApiRequest.cLogout,
	});
};

export const useSetTokenToCookieMutation = () => {
	return useMutation({
		mutationFn: authApiRequest.setTokenToCookie,
	});
};
