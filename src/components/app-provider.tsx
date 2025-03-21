"use client";
import RefreshToken from "@/components/refresh-token";
import { decodeToken, getAccessTokenFromLocalStorage, removeTokensFromLocalStorage } from "@/lib/utils";
import { RoleType } from "@/types/jwt.types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
  UndefinedInitialDataInfiniteOptions,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createContext, useContext, useEffect, useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // refetchOnWindowFocus có nghĩa là tự động fetch lại dữ liệu khi cửa sổ focus (ví dụ: click vào tab khác rồi quay lại tab đang chứa trang web thì nó sẽ tự động fetch lại dữ liệu)
    },
  },
});

const AppConText = createContext({ // createContext tạo ra một context mới, giá trị mặc định của context này là { isAuth: false, setIsAuth: (isAuth: boolean) => {} }
  isAuth: false,
  role: undefined as RoleType | undefined,
  setRole: (role?: RoleType | undefined) => {},
});

export const useAppContext = () => {
  return useContext(AppConText);
};

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRoleState] = useState<RoleType | undefined>();
  useEffect(() => { // chạy useEffect lần đầu để check access token   
    const accessToken = getAccessTokenFromLocalStorage();
    if (accessToken) {
      const role = decodeToken(accessToken).role;
      setRoleState(role);
    }
  },[])

  const isAuth = Boolean(role);

  const setRole = (role?: RoleType | undefined) => {
    if (!role) {
      removeTokensFromLocalStorage();
    }
    setRoleState(role);
  };
  return (
    <AppConText value={{ role, setRole, isAuth}}>
      <QueryClientProvider client={queryClient}>
        <RefreshToken />
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AppConText>
  );
}
