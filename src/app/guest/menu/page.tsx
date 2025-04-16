// fake data

import MenuOrder from "@/app/guest/menu/menu-order";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thực đơn",
  description:
    "Khám phá thực đơn đa dạng với các món ăn hoàng gia tại Bin Restaurant. Từ món khai vị, món chính đến món tráng miệng – tất cả đều sẵn sàng phục vụ bạn.",
};

export default async function MenuPage() {
  return (
    <div className="max-w-[400px] mx-auto space-y-4">
      <h1 className="text-center text-xl font-bold">Thực đơn Hoàng Gia 🔱</h1>
      <MenuOrder />
    </div>
  );
}
