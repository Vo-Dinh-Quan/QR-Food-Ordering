"use client";
import RefreshToken from "@/components/refresh-token";
import {
	decodeToken,
	generateSocketInstance,
	getAccessTokenFromLocalStorage,
	removeTokensFromLocalStorage,
} from "@/lib/utils";
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
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { Socket } from "socket.io-client";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false, // refetchOnWindowFocus có nghĩa là tự động fetch lại dữ liệu khi cửa sổ focus (ví dụ: click vào tab khác rồi quay lại tab đang chứa trang web thì nó sẽ tự động fetch lại dữ liệu)
		},
	},
});

const AppConText = createContext({
	// createContext tạo ra một context mới, giá trị mặc định của context này là { isAuth: false, setIsAuth: (isAuth: boolean) => {} }
	isAuth: false,
	role: undefined as RoleType | undefined,
	setRole: (role?: RoleType | undefined) => {},
	socket: undefined as Socket | undefined,
	setSocket: (socket?: Socket | undefined) => {},
	disconnectSocket: () => {},
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
	const [socket, setSocket] = useState<Socket | undefined>();
	useEffect(() => {
		// chạy useEffect lần đầu để check access token
		const accessToken = getAccessTokenFromLocalStorage();
		if (accessToken) {
			const role = decodeToken(accessToken).role;
			setRoleState(role);
			setSocket(generateSocketInstance(accessToken));
		}
		return () => {
			// cleanup
			if (socket) {
				disconnectSocket();
			}
		};
	}, []);

	const disconnectSocket = useCallback(() => {
		socket?.disconnect();
		setSocket(undefined);
	}, [socket, setSocket]);

	const isAuth = Boolean(role);

	const setRole = (role?: RoleType | undefined) => {
		if (!role) {
			removeTokensFromLocalStorage();
		}
		setRoleState(role);
	};
	return (
		<AppConText
			value={{ role, setRole, isAuth, socket, setSocket, disconnectSocket }}>
			<QueryClientProvider client={queryClient}>
				<RefreshToken />
				{children}
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</AppConText>
	);
}
