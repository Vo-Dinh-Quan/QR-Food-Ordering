import GuestLoginForm from "@/app/(public)/tables/[number]/guest-login-form";
import Image from "next/image";

export default function TableNumberPage() {
	return (
		<div className="text-center p-4">
			<GuestLoginForm />
			<h4 className="mt-10 scroll-m-20 text-xl font-semibold tracking-tight">
				Bin Restaurant - Nơi mang lại hương vị hoàng gia
			</h4>
			<Image
				src="/bin.png"
				alt="Hero Dish"
				width={500}
				height={500}
				className="mt-[100px] object-cover"
			/>
		</div>
	);
}
