// fake data

import MenuOrder from "@/app/guest/menu/menu-order";

export default async function MenuPage() {
	return (
		<div className="max-w-[400px] mx-auto space-y-4">
			<h1 className="text-center text-xl font-bold">Thực đơn Hoàng Gia 🔱</h1>
			<MenuOrder />
		</div>
	);
}
