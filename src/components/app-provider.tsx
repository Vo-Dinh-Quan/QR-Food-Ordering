"use client";
import ListenLogoutSocKet from "@/components/listen-logout-socket";
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
	useRef,
	useState,
} from "react";
import type { Socket } from "socket.io-client";
import { create } from "zustand";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false, // refetchOnWindowFocus có nghĩa là tự động fetch lại dữ liệu khi cửa sổ focus (ví dụ: click vào tab khác rồi quay lại tab đang chứa trang web thì nó sẽ tự động fetch lại dữ liệu)
		},
	},
});

type AppStoreType = {
	role: RoleType | undefined;
	setRole: (role?: RoleType | undefined) => void;
	isAuth: boolean;
	socket: Socket | undefined;
	setSocket: (socket?: Socket | undefined) => void;
	disconnectSocket: () => void;
};

export const useAppStore = create<AppStoreType>((set) => ({
	isAuth: false,
	role: undefined as RoleType | undefined,
	setRole: (role?: RoleType | undefined) => {
		set({ role, isAuth: Boolean(role) });
		if (!role) {
			removeTokensFromLocalStorage();
		}
	},
	socket: undefined as Socket | undefined,
	setSocket: (socket?: Socket | undefined) => set({ socket }),
	disconnectSocket: () =>
		set((state) => {
			state.socket?.disconnect();
			return { socket: undefined };
		}),
}));

// export const useAppStore = () => {
// 	return useContext(AppConText);
// };

export default function AppProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const setRole = useAppStore((state) => state.setRole);
	const setSocket = useAppStore((state) => state.setSocket);

	// const [role, setRoleState] = useState<RoleType | undefined>();
	// const [socket, setSocket] = useState<Socket | undefined>();
	const count = useRef(0);
	useEffect(() => {
		if (count.current === 0) {
			// chạy useEffect lần đầu để check access token
			const accessToken = getAccessTokenFromLocalStorage();
			if (accessToken) {
				const role = decodeToken(accessToken).role;
				setRole(role);
				setSocket(generateSocketInstance(accessToken));
			}
			count.current++;
		}
	}, [setRole, setSocket]);

	// const disconnectSocket = useCallback(() => {
	// 	socket?.disconnect();
	// 	setSocket(undefined);
	// }, [socket, setSocket]);

	// const isAuth = Boolean(role);

	// const setRole = (role?: RoleType | undefined) => {
	// 	if (!role) {
	// 		removeTokensFromLocalStorage();
	// 	}
	// 	setRoleState(role);
	// };
	return (
		// <AppConText
		// 	value={{ role, setRole, isAuth, socket, setSocket, disconnectSocket }}>
		<QueryClientProvider client={queryClient}>
			<RefreshToken />
			<ListenLogoutSocKet />
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
		// </AppConText>
	);
}
