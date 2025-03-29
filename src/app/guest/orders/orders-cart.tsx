"use client";

import { Description } from "@/app/guest/menu/menu-order";
import { useAppStore } from "@/components/app-provider";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/constants/type";
// import socket from "@/lib/socket";
import { formatCurrency, getVietnameseOrderStatus } from "@/lib/utils";
import { useGuestGetOrderList } from "@/queries/useGuest";
import {
	PayGuestOrdersResType,
	UpdateOrderResType,
} from "@/schemaValidations/order.schema";
import Image from "next/image";
import React, { useEffect } from "react";
import { toast } from "sonner";

export default function OrdersCart() {
	const socket = useAppStore((state) => state.socket);
	const { data, refetch } = useGuestGetOrderList();
	const orders = data?.payload.data || [];
	console.log(orders);
	const { waitingForPaying, paid } = orders.reduce(
		(total, order) => {
			if (
				order.status === OrderStatus.Delivered ||
				order.status === OrderStatus.Processing ||
				order.status === OrderStatus.Pending
			) {
				return {
					...total,
					waitingForPaying: {
						price:
							total.waitingForPaying.price +
							order.dishSnapshot.price * order.quantity,
						quantity: total.waitingForPaying.quantity + order.quantity,
					},
				};
			}
			if (order.status === OrderStatus.Paid) {
				return {
					...total,
					paid: {
						price: total.paid.price + order.dishSnapshot.price * order.quantity,
						quantity: total.paid.quantity + order.quantity,
					},
				};
			}
			return total;
		},
		{
			waitingForPaying: {
				price: 0,
				quantity: 0,
			},
			paid: {
				price: 0,
				quantity: 0,
			},
		}
	);

	useEffect(() => {
		if (socket?.connected) {
			onConnect();
		}
		function onConnect() {
			console.log("socket:", socket?.id);
		}

		function onDisconnect() {
			console.log("disconnect");
		}

		function onUpdateOrder(data: UpdateOrderResType["data"]) {
			console.log(data);
			refetch();
			toast(
				`Món ${data.dishSnapshot.name} (SL: ${
					data.quantity
				}) vừa được cập nhật sang trạng thái ${getVietnameseOrderStatus(
					data.status
				)}`,
				{
					action: {
						label: "Ẩn",
						onClick: () => console.log("Undo"),
					},
				}
			);
		}

		function onPayment(data: PayGuestOrdersResType["data"]) {
			const { guest } = data[0];
			toast(
				`${guest?.name} tại bàn ${guest?.tableNumber} đã thanh toán thành công ${data.length} đơn`,
				{
					action: {
						label: "Ẩn",
						onClick: () => console.log("Undo"),
					},
				}
			);
			refetch();
		}

		socket?.on("update-order", onUpdateOrder);
		socket?.on("payment", onPayment);

		socket?.on("connect", onConnect);
		socket?.on("disconnect", onDisconnect);

		return () => {
			socket?.off("connect", onConnect);
			socket?.off("disconnect", onDisconnect);
			socket?.off("update-order", onUpdateOrder);
			socket?.off("payment", onPayment);
		};
	}, [refetch, socket]);

	return (
		<>
			{orders.map((order, index) => (
				<div key={order.id} className="flex justify-around gap-2">
					<div className="text-sm font-semibold">{index + 1}</div>
					<div className="flex-shrink-0 relative">
						<Image
							src={order.dishSnapshot.image}
							alt={order.dishSnapshot.name}
							height={100}
							width={100}
							quality={100}
							className="object-cover w-[80px] h-[80px] rounded-md"
						/>
					</div>
					<div className="space-y-1">
						<h3 className="text-sm font-bold">{order.dishSnapshot.name}</h3>
						{/* Phần description */}
						<p className="text-xs">
							<Description text={order.dishSnapshot.description} />
						</p>
						<div className="text-xs font-semibold">
							{formatCurrency(order.dishSnapshot.price)} x{" "}
							<Badge className="px-1">{order.quantity}</Badge>
						</div>
					</div>
					<div className="flex-shrink-0 ml-auto flex justify-center items-center">
						<Badge variant={"outline"} className="px-1">
							{getVietnameseOrderStatus(order.status)}
						</Badge>
					</div>
				</div>
			))}
			<div className="sticky bottom-0 pt-10">
				<div className="w-full justify-between flex text-sm font-semibold">
					<span>
						Đơn đã thanh toán · {paid.quantity} món [
						{formatCurrency(paid.price)}]
					</span>
				</div>
			</div>
			<div className="sticky ">
				<div className="w-full justify-between flex text-lg font-semibold">
					<span>Đơn chưa thanh toán · {waitingForPaying.quantity} món</span>
					<span>{formatCurrency(waitingForPaying.price)}</span>
				</div>
			</div>
		</>
	);
}
