import OrdersCart from "@/app/guest/orders/orders-cart";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đặt món",
  description:
    "Chọn món yêu thích của bạn từ thực đơn hoàng gia và đặt ngay tại bàn. Đơn giản – Nhanh chóng – Tiện lợi.",
};
export default function OrderPage() {
  return (
    <div className="max-w-[400px] mx-auto space-y-4">
      <h1 className="text-center text-xl font-bold">🍕 Các món đã đặt</h1>
      <OrdersCart />
    </div>
  );
}
