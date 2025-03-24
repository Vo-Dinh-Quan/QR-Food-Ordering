import { toast } from "sonner";
import { EntityError } from "@/lib/http";
import { type ClassValue, clsx } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import jwt from "jsonwebtoken";
import authApiRequest from "@/apiRequests/auth";
import { DishStatus, OrderStatus, Role, TableStatus } from "@/constants/type";
import envConfig from "@/config";
import { TokenPayload } from "@/types/jwt.types";
import guestApiRequest from "@/apiRequests/guest";
import { format } from "date-fns";
import { BookX, CookingPot, HandCoins, Loader, Truck } from "lucide-react";

/**
 * Hàm cn:
 * - Kết hợp các class CSS thông qua clsx và sau đó hợp nhất chúng bằng twMerge để đảm bảo không có class trùng lặp.
 *
 * @param inputs Danh sách các giá trị class (có thể là chuỗi, mảng, đối tượng)
 * @returns Một chuỗi class CSS đã được gộp lại.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Hàm handleErrorApi:
 * - Xử lý lỗi trả về từ API và hiển thị lỗi thông qua toast hoặc gán lỗi cho form.
 * - Nếu lỗi thuộc loại EntityError và có setError từ react-hook-form, sẽ lặp qua từng lỗi và gọi setError để hiển thị lỗi bên trong form.
 * - Nếu không, sẽ hiển thị thông báo toast với thông tin lỗi.
 *
 * @param error Lỗi trả về từ API (có thể là bất kỳ kiểu nào)
 * @param setError (Tùy chọn) Hàm dùng để gán lỗi cho các trường của form.
 * @param duration (Tùy chọn) Thời gian hiển thị thông báo toast, mặc định là 5000ms.
 */
export const handleErrorApi = ({
	error,
	setError,
	duration,
}: {
	error: any;
	setError?: UseFormSetError<any>;
	duration?: number;
}) => {
	// Kiểm tra nếu lỗi là instance của EntityError và hàm setError có sẵn (nghĩa là đang sử dụng form)
	if (error instanceof EntityError && setError) {
		// Nếu nhận được lỗi 422, lặp qua từng lỗi và gọi setError để hiển thị thông báo lỗi ở trường tương ứng
		error.payload.errors.forEach((item) => {
			setError(item.field, {
				type: "server",
				message: item.message,
			});
		});
	} else {
		// Nếu không phải lỗi từ EntityError, hiển thị toast thông báo lỗi tổng quát
		toast("Lỗi", {
			description: error?.payload?.message ?? "Lỗi không xác định",
			action: {
				label: "Ẩn",
				onClick: () => console.log("Lỗi"),
			},
			duration: duration ?? 5000, // Thời gian hiển thị toast (mặc định 5000ms)
		});
	}
};

/**
 * Hàm normalizePath:
 * - Xóa ký tự '/' đầu tiên trong chuỗi path nếu có.
 *
 * @param path Chuỗi đường dẫn cần chuẩn hóa.
 * @returns Chuỗi path đã được loại bỏ ký tự '/' đầu tiên (nếu có).
 */
export const normalizePath = (path: string) => {
	return path.startsWith("/") ? path.slice(1) : path;
};

/**
 * Hàm decodeJWT:
 * - Giải mã token JWT và trả về payload chứa thông tin bên trong.
 * - Sử dụng generic để cho phép chỉ định kiểu dữ liệu cho payload, mặc định là any.
 *
 * @param token Chuỗi token JWT.
 * @returns Payload của token dưới dạng đối tượng.
 */
export const decodeJWT = <Payload = any>(token: string) => {
	return jwt.decode(token) as Payload;
};

// Biến isBrowser dùng để kiểm tra xem mã có đang chạy trong môi trường trình duyệt không
// Điều này quan trọng khi truy cập localStorage, vì localStorage chỉ có sẵn ở phía client
const isBrowser = typeof window !== "undefined";

/**
 * Hàm getAccessTokenFromLocalStorage:
 * - Lấy accessToken từ localStorage nếu đang chạy trên trình duyệt.
 *
 * @returns accessToken dưới dạng chuỗi hoặc null nếu không tìm thấy hoặc không phải môi trường browser.
 */
export const getAccessTokenFromLocalStorage = () =>
	isBrowser ? localStorage.getItem("accessToken") : null;

/**
 * Hàm getRefreshTokenFromLocalStorage:
 * - Lấy refreshToken từ localStorage nếu đang chạy trên trình duyệt.
 *
 * @returns refreshToken dưới dạng chuỗi hoặc null nếu không tìm thấy hoặc không phải môi trường browser.
 */
export const getRefreshTokenFromLocalStorage = () =>
	isBrowser ? localStorage.getItem("refreshToken") : null;

/**
 * Hàm setAccessTokenToLocalStorage:
 * - Lưu accessToken vào localStorage nếu đang chạy trên trình duyệt.
 *
 * @param accessToken Chuỗi accessToken cần lưu.
 */
export const setAccessTokenToLocalStorage = (accessToken: string) =>
	isBrowser ? localStorage.setItem("accessToken", accessToken) : null;

/**
 * Hàm setRefreshTokenToLocalStorage:
 * - Lưu refreshToken vào localStorage nếu đang chạy trên trình duyệt.
 *
 * @param refreshToken Chuỗi refreshToken cần lưu.
 */
export const setRefreshTokenToLocalStorage = (refreshToken: string) =>
	isBrowser ? localStorage.setItem("refreshToken", refreshToken) : null;

/**
 * Hàm removeTokensFromLocalStorage:
 * - Xóa accessToken và refreshToken khỏi localStorage.
 */
export const removeTokensFromLocalStorage = () => {
	localStorage.removeItem("accessToken");
	localStorage.removeItem("refreshToken");
};

/**
 * Hàm checkAndRefreshToken:
 * - Kiểm tra thời gian hết hạn của access token và refresh token.
 * - Nếu refresh token đã hết hạn, xóa token và gọi onError.
 * - Nếu access token sắp hết hạn (dưới 1/3 thời gian hiệu lực), gọi API để refresh token.
 * - Sau khi refresh thành công, cập nhật lại access token và refresh token trong localStorage và gọi onSuccess.
 *
 * @param params (Tùy chọn) Object chứa các hàm callback onError và onSuccess.
 */
export const checkAndRefreshToken = async (params?: {
	onError?: () => void;
	onSuccess?: () => void;
	force?: boolean;
}) => {
	// Lấy accessToken và refreshToken từ localStorage
	const accessToken = localStorage.getItem("accessToken");
	const refreshToken = localStorage.getItem("refreshToken");

	// Nếu chưa đăng nhập (không có token nào) thì không thực hiện tiếp
	if (!accessToken || !refreshToken) return;

	// Giải mã token để lấy thông tin thời gian hết hạn (exp) và thời gian tạo (iat)
	const decodedAccessToken = decodeToken(accessToken);
	const decodedRefreshToken = decodeToken(refreshToken);
	// Lấy thời gian hiện tại tính theo giây (epoch time), trừ 1 giây để khắc phục chênh lệch nhỏ
	const now = new Date().getTime() / 1000 - 1;

	// Nếu refresh token đã hết hạn, xóa token khỏi localStorage và gọi callback onError (nếu có)
	if (now >= decodedRefreshToken.exp) {
		removeTokensFromLocalStorage();
		if (params?.onError) return params.onError();
	}

	// Kiểm tra thời gian còn lại của access token:
	// Nếu thời gian còn lại của access token nhỏ hơn 1/3 tổng thời gian hiệu lực của nó,
	// thì gọi API refresh token để lấy cặp token mới.
	if (
		params?.force ||
		decodedAccessToken.exp - now <
			(decodedAccessToken.exp - decodedAccessToken.iat) / 3
	) {
		try {
			const role = decodedRefreshToken.role;
			// Gọi API refresh token sử dụng authApiRequest hoặc guestApiRequest tùy theo role
			const response =
				role === Role.Guest
					? await guestApiRequest.cRefreshToken()
					: await authApiRequest.cRefreshToken();
			// Cập nhật access token và refresh token mới vào localStorage
			setAccessTokenToLocalStorage(response.payload.data.accessToken);
			setRefreshTokenToLocalStorage(response.payload.data.refreshToken);
			// Gọi callback onSuccess nếu có
			if (params?.onSuccess) params.onSuccess();
		} catch (error) {
			// Nếu có lỗi khi gọi API refresh token, gọi callback onError nếu có
			if (params?.onError) params.onError();
		}
	}
};

/**
 * Hàm formatCurrency:
 * - Định dạng số thành chuỗi tiền tệ theo định dạng Việt Nam (VND).
 *
 * @param number Số cần định dạng.
 * @returns Chuỗi số đã được định dạng theo tiền tệ Việt Nam.
 */
export const formatCurrency = (number: number) => {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(number);
};

/**
 * Hàm getVietnameseDishStatus:
 * - Chuyển đổi trạng thái của món ăn sang dạng tiếng Việt.
 *
 * @param status Trạng thái của món ăn (các giá trị từ DishStatus).
 * @returns Chuỗi trạng thái món ăn bằng tiếng Việt.
 * @status: (typeof DishStatus)[keyof typeof DishStatus]: lấy tất cả các giá trị (values) tương ứng với các khóa của đối tượng hoặc enum (có nghĩa là status có thể nhận bất kỳ giá trị nào từ DishStatus)
 */
export const getVietnameseDishStatus = (
	status: (typeof DishStatus)[keyof typeof DishStatus]
) => {
	switch (status) {
		case DishStatus.Available:
			return "Có sẵn";
		case DishStatus.Unavailable:
			return "Không có sẵn";
		default:
			return "Ẩn";
	}
};

/**
 * Hàm getVietnameseOrderStatus:
 * - Chuyển đổi trạng thái của đơn hàng sang dạng tiếng Việt.
 *
 * @param status Trạng thái của đơn hàng (các giá trị từ OrderStatus).
 * @returns Chuỗi trạng thái đơn hàng bằng tiếng Việt.
 */
export const getVietnameseOrderStatus = (
	status: (typeof OrderStatus)[keyof typeof OrderStatus]
) => {
	switch (status) {
		case OrderStatus.Delivered:
			return "Đã phục vụ";
		case OrderStatus.Paid:
			return "Đã thanh toán";
		case OrderStatus.Pending:
			return "Chờ xử lý";
		case OrderStatus.Processing:
			return "Đang nấu";
		default:
			return "Từ chối";
	}
};

/**
 * Hàm getVietnameseTableStatus:
 * - Chuyển đổi trạng thái của bàn ăn sang dạng tiếng Việt.
 *
 * @param status Trạng thái của bàn (các giá trị từ TableStatus).
 * @returns Chuỗi trạng thái bàn ăn bằng tiếng Việt.
 */
export const getVietnameseTableStatus = (
	status: (typeof TableStatus)[keyof typeof TableStatus]
) => {
	switch (status) {
		case TableStatus.Available:
			return "Có sẵn";
		case TableStatus.Reserved:
			return "Đã đặt";
		default:
			return "Ẩn";
	}
};

/**
 * Hàm getTableLink:
 * - Tạo đường dẫn (URL) cho bàn ăn dựa trên số bàn và token.
 *
 * @param token Token xác thực để truy cập API.
 * @param tableNumber Số thứ tự của bàn.
 * @returns Một URL hoàn chỉnh để truy cập thông tin bàn.
 */
export const getTableLink = ({
	token,
	tableNumber,
}: {
	token: string;
	tableNumber: number;
}) => {
	return (
		envConfig.NEXT_PUBLIC_API_URL + "/tables/" + tableNumber + "?token=" + token
	);
};

export const decodeToken = (token: string) => {
	return jwt.decode(token) as TokenPayload;
};

// chuyển tiếng Việt có dấu thành không dấu
export function removeAccents(str: string) {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D");
}

// Kiểm tra đoạn mathText có tồn tại trong fullText không:
// ví dụ fullText = "Nguyễn Văn A", matchText = "nguyen van a" => true
// dùng để search trong table
export const simpleMatchText = (fullText: string, matchText: string) => {
	return removeAccents(fullText.toLowerCase()).includes(
		removeAccents(matchText.trim().toLowerCase())
	);
};

export const formatDateTimeToLocaleString = (date: string | Date) => {
	return format(
		date instanceof Date ? date : new Date(date),
		"HH:mm:ss dd/MM/yyyy"
	);
};

export const formatDateTimeToTimeString = (date: string | Date) => {
	return format(date instanceof Date ? date : new Date(date), "HH:mm:ss");
};

export const OrderStatusIcon = {
	[OrderStatus.Pending]: Loader,
	[OrderStatus.Processing]: CookingPot,
	[OrderStatus.Rejected]: BookX,
	[OrderStatus.Delivered]: Truck,
	[OrderStatus.Paid]: HandCoins,
};
