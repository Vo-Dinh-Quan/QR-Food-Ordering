import dishApiRequest from "@/apiRequests/dish";
import DishDetail from "@/app/(public)/dishes/[id]/dish-detail";
import { formatCurrency, handleErrorApi, wrapServerApi } from "@/lib/utils";
import { SquareChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function DishPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await paramsPromise;
  const { id } = params;
  const data = await wrapServerApi(() => dishApiRequest.getDish(Number(id)));
  const dish = data?.payload.data;
  return <DishDetail dish={dish} />;
}
