import dishApiRequest from "@/apiRequests/dish";
import Modal from "@/app/(public)/@modal/(.)dishes/[id]/modal";
import DishDetail from "@/app/(public)/dishes/[id]/dish-detail";
import { wrapServerApi } from "@/lib/utils";
import { SquareChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function DishPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await paramsPromise;
  const { id } = params;
  const data = await wrapServerApi(() => dishApiRequest.getDish(Number(id)));
  const dish = data?.payload?.data;

  if (!dish) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold mb-4">Món ăn không tồn tại</h1>
        <p className="text-muted-foreground mb-6">
          Xin lỗi, chúng tôi không tìm thấy món ăn bạn đang tìm kiếm.
        </p>
        <Link
          href="/"
          className="inline-flex items-center mb-6 font-semibold text-muted-foreground transition-colors hover:text-foreground flex-shrink-0">
          <SquareChevronLeft className="w-5 h-5 mr-2" />
          Quay lại
        </Link>
      </div>
    );
  }
  return (
    <Modal>
      <DishDetail dish={dish} />
    </Modal>
  );
}
