"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	createContext,
	Suspense,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	formatCurrency,
	getVietnameseDishStatus,
	handleErrorApi,
} from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import AutoPagination from "@/components/auto-pagination";
import { DishListResType } from "@/schemaValidations/dish.schema";
import EditDish from "@/app/manage/dishes/edit-dish";
import AddDish from "@/app/manage/dishes/add-dish";
import { useDeleteDishMutation, useDishListQuery } from "@/queries/useDish";
import { toast } from "sonner";
import TableSkeleton from "@/app/manage/orders/table-skeleton";

type DishItem = DishListResType["data"][0];

const DishTableContext = createContext<{
	setDishIdEdit: (value: number) => void; // Set giá trị id của món ăn cần sửa
	dishIdEdit: number | undefined; // Id của món ăn cần sửa
	dishDelete: DishItem | null; // Món ăn cần xóa
	setDishDelete: (value: DishItem | null) => void; // Set món ăn cần xóa
}>({
	setDishIdEdit: (value: number | undefined) => {},
	dishIdEdit: undefined,
	dishDelete: null,
	setDishDelete: (value: DishItem | null) => {},
});

export const columns: ColumnDef<DishItem>[] = [
	{
		accessorKey: "id",
		header: "ID",
	},
	{
		accessorKey: "image",
		header: "Ảnh",
		cell: ({ row }) => (
			<div>
				<Avatar className="aspect-square w-[80px] h-[80px] rounded-md object-cover">
					<AvatarImage src={row.getValue("image")} className="object-cover" />
					<AvatarFallback className="rounded-none">
						{row.original.name}
					</AvatarFallback>
				</Avatar>
			</div>
		),
	},
	{
		accessorKey: "name",
		header: "Tên",
		cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
	},
	{
		accessorKey: "price",
		header: "Giá cả",
		cell: ({ row }) => (
			<div className="capitalize">{formatCurrency(row.getValue("price"))}</div>
		),
	},
	{
		accessorKey: "description",
		header: "Mô tả",
		cell: ({ row }) => (
			<div
				dangerouslySetInnerHTML={{
					__html: DOMPurify.sanitize(row.getValue("description")),
				}}
				className="whitespace-pre-line"
			/>
		),
	},
	{
		accessorKey: "status",
		header: "Trạng thái",
		cell: ({ row }) => (
			<div>{getVietnameseDishStatus(row.getValue("status"))}</div>
		),
	},
	{
		id: "actions",
		enableHiding: false,
		cell: function Actions({ row }) {
			const { setDishIdEdit, setDishDelete } = useContext(DishTableContext);
			const openEditDish = () => {
				setDishIdEdit(row.original.id);
			};

			const openDeleteDish = () => {
				setDishDelete(row.original);
			};
			return (
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<DotsHorizontalIcon className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={openEditDish}>Sửa</DropdownMenuItem>
						<DropdownMenuItem onClick={openDeleteDish}>Xóa</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

function AlertDialogDeleteDish({
	dishDelete,
	setDishDelete,
}: {
	dishDelete: DishItem | null;
	setDishDelete: (value: DishItem | null) => void;
}) {
	const { mutateAsync } = useDeleteDishMutation();
	const deleteDish = async () => {
		if (dishDelete) {
			try {
				const response = await mutateAsync(dishDelete.id);
				setDishDelete(null);
				toast(response.payload.message, {
					action: {
						label: "Ẩn",
						onClick: () => console.log("Undo"),
					},
				});
			} catch (error) {
				handleErrorApi({
					error,
				});
			}
		}
	};
	return (
		<AlertDialog
			open={Boolean(dishDelete)}
			onOpenChange={(value) => {
				// onOpenChange sẽ được gọi khi dialog nhấn Cancel
				// Khi đóng dialog, đặt lại employeeDelete về null
				if (!value) {
					setDishDelete(null);
				}
			}}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Xóa món ăn?</AlertDialogTitle>
					<AlertDialogDescription>
						Món{" "}
						<span className="bg-foreground text-primary-foreground rounded px-1">
							{dishDelete?.name}
						</span>{" "}
						sẽ bị xóa vĩnh viễn
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={deleteDish}>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 5;
export default function DishTable() {
	const searchParam = useSearchParams();
	const page = searchParam.get("page") ? Number(searchParam.get("page")) : 1;
	const pageIndex = page - 1;
	const [dishIdEdit, setDishIdEdit] = useState<number | undefined>();
	const [dishDelete, setDishDelete] = useState<DishItem | null>(null);

	const dishListQuery = useDishListQuery();
	const data: any[] = dishListQuery.data?.payload.data ?? [];
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});
	const [pagination, setPagination] = useState({
		pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
		pageSize: PAGE_SIZE, //default page size
	});

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onPaginationChange: setPagination,
		autoResetPageIndex: false,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			pagination,
		},
	});

	useEffect(() => {
		table.setPagination({
			pageIndex,
			pageSize: PAGE_SIZE,
		});
	}, [table, pageIndex]);

	return (
		<Suspense>
			<DishTableContext.Provider
				value={{ dishIdEdit, setDishIdEdit, dishDelete, setDishDelete }}>
				<div className="w-full">
					<EditDish id={dishIdEdit} setId={setDishIdEdit} />
					<AlertDialogDeleteDish
						dishDelete={dishDelete}
						setDishDelete={setDishDelete}
					/>
					<div className="flex items-center py-4">
						<Input
							placeholder="Lọc tên"
							value={
								(table.getColumn("name")?.getFilterValue() as string) ?? ""
							}
							onChange={(event) =>
								table.getColumn("name")?.setFilterValue(event.target.value)
							}
							className="max-w-sm"
						/>
						<div className="ml-auto flex items-center gap-2">
							<AddDish />
						</div>
					</div>
					{dishListQuery.isPending && <TableSkeleton />}
					{!dishListQuery.isPending && (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									{table.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id}>
											{headerGroup.headers.map((header) => {
												return (
													<TableHead key={header.id}>
														{header.isPlaceholder
															? null
															: flexRender(
																	header.column.columnDef.header,
																	header.getContext()
															  )}
													</TableHead>
												);
											})}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									{table.getRowModel().rows?.length ? (
										table.getRowModel().rows.map((row) => (
											<TableRow
												key={row.id}
												data-state={row.getIsSelected() && "selected"}>
												{row.getVisibleCells().map((cell) => (
													<TableCell key={cell.id}>
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext()
														)}
													</TableCell>
												))}
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell
												colSpan={columns.length}
												className="h-24 text-center">
												No results.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					)}
					<div className="flex items-center justify-end space-x-2 py-4">
						<div className="text-xs text-muted-foreground py-4 flex-1 ">
							Hiển thị{" "}
							<strong>{table.getPaginationRowModel().rows.length}</strong> trong{" "}
							<strong>{data.length}</strong> kết quả
						</div>
						<div>
							<AutoPagination
								page={table.getState().pagination.pageIndex + 1}
								pageSize={table.getPageCount()}
								pathname="/manage/dishes"
							/>
						</div>
					</div>
				</div>
			</DishTableContext.Provider>
		</Suspense>
	);
}
