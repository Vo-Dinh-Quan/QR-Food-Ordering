import OrderTable from "@/app/manage/orders/order-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Suspense } from "react";

export default function AccountsPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2 w-full max-w-full overflow-x-hidden">
        <Card
          className="w-full max-w-full overflow-x-auto"
          x-chunk="dashboard-06-chunk-0">
          <CardHeader className="min-w-0">
            <CardTitle>Đơn hàng</CardTitle>
            <CardDescription>Quản lý đơn hàng</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 overflow-x-auto">
            <Suspense>
              <div className="min-w-0 overflow-x-auto">
                <OrderTable />
              </div>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

// note khi làm responsive trên mobile: muốn đảm bảo rằng Card luôn giữ nguyên chiều rộng bằng chiều rộng của màn hình (view) hiện tại, không vượt quá dù có bao nhiêu nội dung bên trong. Các nội dung bên trong nếu quá lớn thì sẽ cuộn ngang (hoặc bị ẩn/cắt) chứ không được làm rộng Card ra ngoài màn hình

/*
✅ Cách làm:
Cần đảm bảo 3 điều:

  Card có w-full max-w-full overflow-x-auto

  Nội dung bên trong không phá layout bằng min-w-0

  Và nếu muốn cuộn được, đảm bảo overflow-x-auto ở vùng nội dung.

 */
