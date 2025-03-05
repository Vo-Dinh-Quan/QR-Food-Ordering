import dishApiRequest from "@/apiRequests/dish";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { DishListResType } from "@/schemaValidations/dish.schema";
import Image from "next/image";

export default async function Home() {
  let dishList: DishListResType["data"] = [];
  try {
    const response = await dishApiRequest.list();
    const {
      payload: { data },
    } = response;
    dishList = data;
  } catch (error) {
    return <div>Something went wrong</div>;
  }

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="pb-10 px-4 flex flex-col-reverse md:flex-row items-center justify-center gap-8">
        {/* Text Content (40%) */}
        <div className="w-full md:w-2/5">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Chúng tôi không nấu ăn, chúng tôi tạo ra cảm xúc của bạn!
          </h1>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            Món ăn Việt Nam khiến người ta liên tưởng đến những bữa tối thịnh
            soạn của gia đình. Vì vậy, bạn có thể muốn định vị nhà hàng của mình
            là nơi đón tiếp cả gia đình.
          </p>
        </div>

        {/* Hero Image */}
        <div className="w-full md:w-3/5 flex justify-center relative">
          <div className="relative inline-block">
            <h2 className="absolute top-[0%] left-[0%] scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              BIN KING – The Taste of Royalty
            </h2>
            {/* Ảnh chính (có thể để hình tròn hoặc bo góc) */}
            <Image
              src="/banner1.png" // Thay bằng đường dẫn ảnh chính
              alt="Hero Dish"
              width={500}
              height={500}
              // Có thể để "rounded-md" nếu bạn không muốn tròn hoàn toàn
              className="rounded-full object-cover hover:scale-105 transition transform duration-300"
            />

            {/* 3 ảnh nhỏ quanh mép bên phải, bạn tuỳ chỉnh toạ độ */}
            <Image
              src="/banner2.png" // Thay đường dẫn ảnh 2
              alt="Mini Banner 1"
              width={100}
              height={100}
              className="rounded-full object-cover absolute top-[15%] right-[-15%] hover:scale-105 transition transform duration-300"
            />
            <Image
              src="/banner3.png" // Thay đường dẫn ảnh 3
              alt="Mini Banner 2"
              width={100}
              height={100}
              className="rounded-full object-cover absolute top-[50%] right-[-20%] translate-y-[-50%] hover:scale-105 transition transform duration-300"
            />
            <Image
              src="/banner4.png" // Thay đường dẫn ảnh 4
              alt="Mini Banner 3"
              width={80}
              height={80}
              className="rounded-full object-cover absolute bottom-[15%] right-[-15%] hover:scale-105 transition transform duration-300"
            />
          </div>
        </div>
      </section>

      {/* Most Popular Food Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-3xl font-bold mb-10">
            Món Ăn Tốt Nhất Cho Những Khoảnh Khắc Đẹp Nhất
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {dishList.slice(0, 4).map((dish) => (
              <div
                key={dish.id}
                className="p-4 rounded-lg shadow hover:shadow-lg transition">
                <Image
                  src={dish.image}
                  width={400}
                  height={400}
                  alt={dish.name}
                  className="w-[250px] h-[250px] object-cover rounded-md mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{dish.name}</h3>
                <p className=" text-sm mb-2">{dish.description}</p>
                <p className="text-lg font-bold mb-2">
                  {formatCurrency(dish.price)}
                </p>
                {/* Rating tạm thời - bạn có thể tuỳ biến */}
                <div className="flex items-center">
                  <span className="text-yellow-400 text-xl mr-1">★</span>
                  <span className="text-yellow-400 text-xl mr-1">★</span>
                  <span className="text-yellow-400 text-xl mr-1">★</span>
                  <span className="text-yellow-400 text-xl mr-1">★</span>
                  <span className="text-gray-300 text-xl">★</span>
                  <span className="text-sm text-gray-600 ml-2">4.0</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button >
              Khám phá thực đơn của chúng tôi
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
