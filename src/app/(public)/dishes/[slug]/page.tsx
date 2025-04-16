// app/(public)/dishes/[id]/page.tsx
import dishApiRequest from "@/apiRequests/dish";
import DishDetail from "@/app/(public)/dishes/[slug]/dish-detail";
import { baseOpenGraph } from "@/app/shared-metadata";
import envConfig from "@/config";
import { getIdFromSlugUrl, wrapServerApi } from "@/lib/utils";
import { Metadata } from "next";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await wrapServerApi(() =>
    dishApiRequest.getDish(Number(params.slug))
  );
  const dish = data?.payload?.data;
  const url = envConfig.NEXT_PUBLIC_API_URL + "/dishes/" + dish?.id;

  if (!dish) {
    return {
      title: "Món ăn không tồn tại",
      description:
        "Xin lỗi, chúng tôi không tìm thấy món ăn bạn đang tìm kiếm.",
    };
  }
  return {
    title: `${dish.name}`,
    description: dish.description,
    openGraph: {
      ...baseOpenGraph,
      title: `${dish.name}`,
      description: dish.description,
      url,
      siteName: "Bin Restaurant",
      images: [
        {
          url: dish.image, // Must be an absolute URL
          // width: 800,
          // height: 600,
        },
      ],
    },
    alternates: {
      canonical: url,
      languages: {
        "vi-VN": url,
        "en-US": "/en",
      },
    },
  };
}

export default async function DishPage({ params }: Props) {
  const id = getIdFromSlugUrl(params.slug);
  const data = await wrapServerApi(() => dishApiRequest.getDish(Number(id)));
  const dish = data?.payload?.data;
  return <DishDetail dish={dish} />;
}
