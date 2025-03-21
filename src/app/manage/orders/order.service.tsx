// Import các kiểu dữ liệu được định nghĩa từ file order-table, gồm:
// - OrderObjectByGuestID: đối tượng nhóm các đơn hàng theo guestId (mỗi guestId ánh xạ tới một mảng đơn hàng)
// - ServingGuestByTableNumber: đối tượng nhóm các guest đang phục vụ theo số bàn (mỗi bàn chứa một đối tượng guest)
// - Statics: đối tượng chứa các thống kê tổng hợp về trạng thái đơn hàng và thông tin theo bàn
import {
	OrderObjectByGuestID,
	ServingGuestByTableNumber,
	Statics,
} from "@/app/manage/orders/order-table";

// Import OrderStatus từ constants, chứa các giá trị trạng thái của đơn hàng (ví dụ: Pending, Processing, Delivered, Paid, Rejected)
import { OrderStatus } from "@/constants/type";

// Import kiểu dữ liệu GetOrdersResType từ schema của đơn hàng, định nghĩa cấu trúc dữ liệu mà API trả về khi lấy danh sách đơn hàng
import { GetOrdersResType } from "@/schemaValidations/order.schema";

// Import hook useMemo của React, dùng để ghi nhớ kết quả tính toán dựa trên dependency, tránh thực hiện lại phép tính khi không cần thiết
import { useMemo } from "react";

/**
 * Custom hook useOrderService
 *
 * Mục đích:
 * - Nhận vào danh sách đơn hàng (orderList) theo kiểu GetOrdersResType['data'].
 * - Tính toán và nhóm dữ liệu thành các đối tượng thống kê:
 *    + statics: thống kê tổng số lượng đơn hàng theo từng trạng thái và thống kê theo bàn & guest.
 *    + orderObjectByGuestId: nhóm các đơn hàng theo guestId.
 *    + servingGuestByTableNumber: nhóm các guest đang được phục vụ (có đơn hàng với trạng thái Pending, Processing, Delivered) theo số bàn.
 *
 * useMemo được sử dụng để đảm bảo các tính toán này chỉ được thực hiện lại khi orderList thay đổi.
 */
export const useOrderService = (orderList: GetOrdersResType["data"]) => {
	// Sử dụng useMemo để tính toán và ghi nhớ kết quả dựa trên dependency là orderList
	const result = useMemo(() => {
		// Khởi tạo đối tượng statics theo kiểu Statics.
		// statics bao gồm:
		// - status: đối tượng đếm số lượng đơn hàng theo trạng thái, khởi tạo ban đầu với tất cả giá trị là 0.
		// - table: đối tượng lưu trữ thống kê chi tiết theo số bàn và guest, ban đầu là một object rỗng.
		const statics: Statics = {
			status: {
				Pending: 0,
				Processing: 0,
				Delivered: 0,
				Paid: 0,
				Rejected: 0,
			},
			table: {},
		};

		// Khởi tạo object để nhóm đơn hàng theo guestId
		// Mỗi key là guestId (kiểu number) và giá trị là mảng các đơn hàng của guest đó.
		const orderObjectByGuestId: OrderObjectByGuestID = {};

		// Khởi tạo object để nhóm các guest theo số bàn.
		const guestByTableNumber: ServingGuestByTableNumber = {};

		// Duyệt qua từng đơn hàng trong orderList để cập nhật các đối tượng thống kê và nhóm đơn hàng
		orderList.forEach((order) => {
			// Cập nhật bộ đếm tổng cho từng trạng thái đơn hàng:
			// Lấy trạng thái của đơn hàng (order.status) và tăng giá trị đếm tương ứng trong statics.status lên 1.
			statics.status[order.status] = statics.status[order.status] + 1;

			// Kiểm tra điều kiện: đảm bảo rằng cả tableNumber và guestId của đơn hàng đều không bị xóa (không null)
			if (order.tableNumber !== null && order.guestId !== null) {
				// Nếu đối tượng thống kê cho số bàn hiện tại chưa tồn tại, khởi tạo một object rỗng cho bàn đó.
				if (!statics.table[order.tableNumber]) {
					statics.table[order.tableNumber] = {};
				}
				// Cập nhật thống kê cho guest trên bàn:
				// - Sử dụng spread operator để giữ lại các trạng thái đã có của guest đó trên bàn hiện tại.
				// - Tăng giá trị đếm cho trạng thái hiện tại của đơn hàng (order.status) lên 1.
				// - Dùng toán tử nullish (??) để đảm bảo nếu chưa có giá trị cho trạng thái đó thì mặc định là 0.
				statics.table[order.tableNumber][order.guestId] = {
					...statics.table[order.tableNumber]?.[order.guestId],
					[order.status]:
						(statics.table[order.tableNumber]?.[order.guestId]?.[
							order.status
						] ?? 0) + 1,
				};
			}

			// Nhóm đơn hàng theo guestId:
			// Nếu order có guestId hợp lệ (không undefined hoặc null)
			if (order.guestId) {
				// Nếu chưa tồn tại mảng đơn hàng cho guest đó trong orderObjectByGuestId, khởi tạo mảng rỗng
				if (!orderObjectByGuestId[order.guestId]) {
					orderObjectByGuestId[order.guestId] = [];
				}
				// Thêm đơn hàng hiện tại vào mảng đơn hàng của guest đó
				orderObjectByGuestId[order.guestId].push(order);
			}

			// Nhóm guest theo số bàn:
			// Nếu đơn hàng có cả tableNumber và guestId hợp lệ
			if (order.tableNumber && order.guestId) {
				// Nếu chưa có dữ liệu cho số bàn hiện tại trong guestByTableNumber, khởi tạo một object rỗng cho bàn đó
				if (!guestByTableNumber[order.tableNumber]) {
					guestByTableNumber[order.tableNumber] = {};
				}
				// Gán danh sách đơn hàng của guest (đã được nhóm trong orderObjectByGuestId) cho guest đó trong object guestByTableNumber
				guestByTableNumber[order.tableNumber][order.guestId] =
					orderObjectByGuestId[order.guestId];
			}
		});

		// Sau khi duyệt qua tất cả các đơn hàng, thực hiện lọc để chỉ giữ lại các guest "đang phục vụ"
		// Guest được xem là "đang phục vụ" nếu có ít nhất một đơn hàng với trạng thái là Pending, Processing hoặc Delivered.
		const servingGuestByTableNumber: ServingGuestByTableNumber = {};
		// Duyệt qua từng bàn có chứa guest trong guestByTableNumber
		for (const tableNumber in guestByTableNumber) {
			// Lấy đối tượng chứa các guest cho số bàn hiện tại
			const guestsObject = guestByTableNumber[tableNumber];
			// Khởi tạo một object để lưu các guest đang phục vụ cho bàn này
			const servingGuestObject: OrderObjectByGuestID = {};
			// Duyệt qua từng guest trong bàn (key của guestObject chính là guestId)
			for (const guestId in guestsObject) {
				// Lấy danh sách đơn hàng của guest hiện tại
				const guestOrders = guestsObject[guestId];
				// Kiểm tra xem guest này có đơn hàng nào có trạng thái đang phục vụ hay không.
				// Sử dụng hàm some để kiểm tra nếu có bất kỳ đơn hàng nào có trạng thái nằm trong danh sách [Pending, Processing, Delivered]
				const isServingGuest = guestOrders.some((order) =>
					[
						OrderStatus.Pending,
						OrderStatus.Processing,
						OrderStatus.Delivered,
					].includes(order.status as any)
				);
				// Nếu guest có đơn hàng đang phục vụ, thêm guest đó vào servingGuestObject
				if (isServingGuest) {
					// Ép kiểu guestId sang số (Number) để đảm bảo key có kiểu number
					servingGuestObject[Number(guestId)] = guestOrders;
				}
			}
			// Nếu servingGuestObject không rỗng (có chứa ít nhất một guest đang phục vụ), thêm nó vào servingGuestByTableNumber
			if (Object.keys(servingGuestObject).length) {
				// Chuyển tableNumber sang kiểu số và gán servingGuestObject cho số bàn đó
				servingGuestByTableNumber[Number(tableNumber)] = servingGuestObject;
			}
		}

		// Trả về một object chứa các dữ liệu đã được tính toán:
		// - statics: thống kê tổng số lượng đơn hàng theo từng trạng thái và thông tin chi tiết theo số bàn và guest.
		// - orderObjectByGuestId: đối tượng nhóm các đơn hàng theo guestId.
		// - servingGuestByTableNumber: đối tượng nhóm các guest đang được phục vụ theo số bàn.
		return {
			statics,
			orderObjectByGuestId,
			servingGuestByTableNumber,
		};
	}, [orderList]); // useMemo chỉ chạy lại khi orderList thay đổi

	// Trả về kết quả đã tính toán của hook useOrderService
	return result;
};
