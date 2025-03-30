import dishApiRequest from "@/apiRequests/dish";
import { formatCurrency, handleErrorApi, wrapServerApi } from "@/lib/utils";
import { SquareChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function DishPage({
	params: { id },
}: {
	params: { id: string };
}) {
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

	// Giá trị số lượng đặt mua (demo, bạn có thể tích hợp useState nếu là client component)
	const quantity = 1;

	return (
		<div className="max-w-screen-2xl mx-auto px-8">
			{/* Nút quay lại */}
			<Link
				href="/"
				className="inline-flex items-center mb-6 font-semibold text-muted-foreground transition-colors hover:text-foreground flex-shrink-0">
				<SquareChevronLeft className="w-5 h-5 mr-2" />
				Quay lại
			</Link>

			<div className="flex flex-col md:flex-row gap-10">
				{/* Hình ảnh món ăn */}
				<div className="md:w-1/2 w-full relative h-80 md:h-[400px] lg:h-[500px]">
					<Image
						src={dish.image}
						alt={dish.name}
						fill
						className="object-cover rounded-md md:rounded-xl"
					/>
				</div>

				{/* Thông tin chi tiết món ăn */}
				<div className="md:w-1/2  w-full flex flex-col gap-6">
					<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
						{dish.name}
					</h1>

					{/* Mô tả món ăn */}
					<p className="leading-7 [&:not(:first-child)]:mt-6">
						{dish.description}
					</p>
					{/* Giá tiền đã format */}
					<p className="text-2xl font-semibold">{formatCurrency(dish.price)}</p>
				</div>
			</div>
		</div>
	);
}
