"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDishListQuery } from "@/queries/useDish";
import { cn, formatCurrency, handleErrorApi } from "@/lib/utils";
import Quantity from "@/app/guest/menu/quantity";
import { GuestCreateOrdersBodyType } from "@/schemaValidations/guest.schema";
import { useGuestOrderMutation } from "@/queries/useGuest";
import { useRouter } from "next/navigation";
import { DishStatus } from "@/constants/type";

// Component riêng chỉ xử lý hiển thị description
export function Description({ text }: { text: string }) {
	const [expanded, setExpanded] = useState(false);

	return (
		<>
			{expanded ? (
				// Khi đã mở rộng, hiển thị toàn bộ description
				<span>
					{text}
					{/* Nút Ẩn để thu gọn lại */}
					<span
						className="font-bold cursor-pointer ml-1"
						onClick={() => setExpanded(false)}>
						Ẩn
					</span>
				</span>
			) : (
				// Khi ở trạng thái thu gọn: giới hạn 1 dòng với ellipsis
				<span className="inline-block max-w-[150px] overflow-hidden whitespace-nowrap text-ellipsis align-top">
					{text}
				</span>
			)}

			{/* Nếu chưa mở rộng, hiển thị nút "chi tiết" */}
			{!expanded && (
				<span
					className="font-bold cursor-pointer ml-1"
					onClick={() => setExpanded(true)}>
					chi tiết
				</span>
			)}
		</>
	);
}

export default function MenuOrder() {
	const { data } = useDishListQuery();
	const dishes = data?.payload.data || [];
	const { mutateAsync } = useGuestOrderMutation();
	const router = useRouter();
	const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([]);
	const totalPrice = () => {
		return dishes.reduce((total, dish) => {
			const order = orders.find((order) => order.dishId === dish.id);
			if (!order) {
				return total;
			} else {
				return total + dish.price * order.quantity;
			}
		}, 0);
	};

	const handleQuantityChange = (id: number, quantity: number) => {
		setOrders((prevOrders) => {
			if (quantity === 0) {
				// nếu quantity = 0 thì xóa order đó ra khỏi list
				return prevOrders.filter((order) => order.dishId !== id);
			}
			const orderIndex = prevOrders.findIndex((order) => order.dishId === id);
			if (orderIndex === -1) {
				// nếu order chưa tồn tại thì thêm vào list
				return [...prevOrders, { dishId: id, quantity }];
			}
			const newOrders = [...prevOrders];
			// tạo ra 1 object mới với tất cả các thuộc tính của order cũ, ghi đè lại quantity
			newOrders[orderIndex] = { ...newOrders[orderIndex], quantity };
			return newOrders;
		});
	};

	const handleOrder = async () => {
		try {
			await mutateAsync(orders);
			router.push("/guest/orders");
		} catch (error) {
			handleErrorApi({ error });
		}
	};
	return (
		<>
			{dishes.filter((dish) => dish.status !== DishStatus.Hidden).map((dish) => (
				<div
					key={dish.id}
					className={cn("flex gap-2", {
						"pointer-events-none": dish.status === DishStatus.Unavailable,
					})}>
					<div className="flex-shrink-0 relative">
						{dish.status === DishStatus.Unavailable && (
							<div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
								<span className="text-white font-bold">Hết hàng</span>
							</div>
						)}
						<Image
							src={dish.image}
							alt={dish.name}
							height={100}
							width={100}
							quality={100}
							className="object-cover w-[80px] h-[80px] rounded-md"
						/>
					</div>
					<div className="space-y-1">
						<h3 className="text-sm font-bold">{dish.name}</h3>
						{/* Phần description */}
						<p className="text-xs">
							<Description text={dish.description} />
						</p>
						<p className="text-xs font-semibold">
							{formatCurrency(dish.price)}
						</p>
					</div>
					<div className="flex-shrink-0 ml-auto flex justify-center items-center">
						<Quantity
							onChange={(value) => handleQuantityChange(dish.id, value)}
							// tìm trong dishes có dish nào có id trùng với id của order không, nếu có thì lấy quantity của order đó, nếu không thì lấy 0
							value={
								orders.find((order) => order.dishId === dish.id)?.quantity || 0
							}
						/>
					</div>
				</div>
			))}
			<div className="sticky bottom-0">
				<Button
					className="w-full justify-between"
					onClick={handleOrder}
					disabled={orders.length === 0}>
					<span>Đặt hàng · {orders.length} món</span>
					<span>{formatCurrency(totalPrice())}</span>
				</Button>
			</div>
		</>
	);
}
