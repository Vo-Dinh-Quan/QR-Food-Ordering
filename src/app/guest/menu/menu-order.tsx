"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDishListQuery } from "@/queries/useDish";
import { formatCurrency } from "@/lib/utils";
import Quantity from "@/app/guest/menu/quantity";
import { GuestCreateOrdersBodyType } from "@/schemaValidations/guest.schema";

// Component riêng chỉ xử lý hiển thị description
function Description({ text }: { text: string }) {
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
				<span className="inline-block max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis align-top">
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
	const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([]);
  const totalPrice = () => {
    return dishes.reduce((total, dish) => {
      const order = orders.find((order) => order.dishId === dish.id);
      if (!order) {
        return total;
      }else {
        return total + dish.price * order.quantity;
      }
    }, 0)
  }

	const handleQuantityChange = (id: number, quantity: number) => {
    setOrders((prevOrders) => {
      if (quantity === 0) { // nếu quantity = 0 thì xóa order đó ra khỏi list
        return prevOrders.filter((order) => order.dishId !== id);
      }
      const orderIndex = prevOrders.findIndex((order) => order.dishId === id);
      if (orderIndex === -1) { // nếu order chưa tồn tại thì thêm vào list
        return [...prevOrders, { dishId: id, quantity }];
      }
      const newOrders = [...prevOrders];
      // tạo ra 1 object mới với tất cả các thuộc tính của order cũ, ghi đè lại quantity
      newOrders[orderIndex] = { ...newOrders[orderIndex], quantity };
      return newOrders;
    })
  };

  console.log(orders);
	return (
		<>
			{dishes.map((dish) => (
				<div key={dish.id} className="flex gap-4">
					<div className="flex-shrink-0">
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
						<Quantity  onChange={(value) => handleQuantityChange(dish.id, value)}
            // tìm trong dishes có dish nào có id trùng với id của order không, nếu có thì lấy quantity của order đó, nếu không thì lấy 0
              value={orders.find((order) => order.dishId === dish.id)?.quantity || 0}
            />
					</div>
				</div>
			))}
			<div className="sticky bottom-0">
				<Button className="w-full justify-between">
					<span>Giỏ hàng · {orders.length} món</span>
					<span>{formatCurrency(totalPrice())}</span>
				</Button>
			</div>
		</>
	);
}
