"use client";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // refetchOnWindowFocus có nghĩa là tự động fetch lại dữ liệu khi cửa sổ focus (ví dụ: click vào tab khác rồi quay lại tab đang chứa trang web thì nó sẽ tự động fetch lại dữ liệu)
      refetchOnMount: false,
    },
  },
});

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
