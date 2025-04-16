import dishApiRequest from "@/apiRequests/dish";
import { Button } from "@/components/ui/button";
import { formatCurrency, generateSlugUrl } from "@/lib/utils";
import { DishListResType } from "@/schemaValidations/dish.schema";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang chủ",
};

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
      <section className=" flex flex-col-reverse md:flex-row items-center justify-center gap-8">
        {/* Text Content (40%) */}
        <div className="w-full md:w-2/5 relative">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight ">
            Bin Restaurant 🍕 Nơi mang lại hương vị hoàng gia!
          </h1>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            Không chỉ là một nhà hàng, mà là biểu tượng của sự tinh tế. Chúng
            tôi mang đến những kiệt tác ẩm thực, nơi hương vị thượng lưu gặp gỡ
            không gian xa hoa, tạo nên trải nghiệm đẳng cấp dành riêng cho những
            thực khách sành điệu nhất.
          </p>
        </div>

        {/* Hero Image */}
        <div className="w-full md:w-3/5 flex justify-center lg:justify-end relative">
          <div className="relative inline-block">
            <Image
              src="/bin1.png"
              alt="Hero Dish"
              width={500}
              height={500}
              className="mt-10 md:mt-5 lg:mt-0 object-cover transition-transform duration-300 hover:translate-x-[-100px]"
            />

            {/* 3 Small Images */}
            <Image
              src="/banner2.png"
              alt="Mini Banner 1"
              width={100}
              height={100}
              className="rounded-full object-cover absolute top-[15%] left-[-15%] hover:scale-150 transition transform duration-300 hidden xl:block" // Hidden on mobile
            />
            <Image
              src="/banner3.png"
              alt="Mini Banner 2"
              width={100}
              height={100}
              className="rounded-full object-cover absolute top-[50%] left-[-20%] translate-y-[-50%] hover:scale-150 transition transform duration-300 hidden xl:block" // Hidden on mobile
            />
            <Image
              src="/banner4.png"
              alt="Mini Banner 3"
              width={80}
              height={80}
              className="rounded-full object-cover absolute bottom-[15%] left-[-15%] hover:scale-150 transition transform duration-300 hidden xl:block" // Hidden on mobile
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {dishList.slice(0, 4).map((dish) => (
              <Link
                href={`/dishes/${generateSlugUrl({
                  name: dish.name,
                  id: dish.id,
                })}`}
                key={dish.id}>
                <div className="m-4 rounded-xl overflow-hidden cursor-pointer">
                  <Image
                    src={dish.image}
                    width={400}
                    height={400}
                    alt={dish.name}
                    className="w-full h-[250px] object-cover mb-4 hover:scale-105 transition transform duration-300"
                  />
                  <h3 className="text-xl font-semibold mb-2">{dish.name}</h3>
                  <p className="text-sm mb-2">{dish.description}</p>
                  <p className="text-lg font-bold mb-2">
                    {formatCurrency(dish.price)}
                  </p>
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-xl mr-1">★</span>
                    <span className="text-yellow-400 text-xl mr-1">★</span>
                    <span className="text-yellow-400 text-xl mr-1">★</span>
                    <span className="text-yellow-400 text-xl mr-1">★</span>
                    <span className="text-yellow-400 text-xl mr-1">★</span>
                    <span className="text-sm text-gray-600 ml-2">5.0</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button>Khám phá thực đơn của chúng tôi</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
