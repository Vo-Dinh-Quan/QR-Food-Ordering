"use client";

import {
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GetOrdersResType,
  PayGuestOrdersResType,
  UpdateOrderResType,
} from "@/schemaValidations/order.schema";
import AddOrder from "@/app/manage/orders/add-order";
import EditOrder from "@/app/manage/orders/edit-order";
import {
  createContext,
  Suspense,
  use,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import AutoPagination from "@/components/auto-pagination";
import { getVietnameseOrderStatus, handleErrorApi } from "@/lib/utils";
import { OrderStatusValues } from "@/constants/type";
import OrderStatics from "@/app/manage/orders/order-statics";
import orderTableColumns from "@/app/manage/orders/order-table-columns";
import { useOrderService } from "@/app/manage/orders/order.service";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { endOfDay, format, startOfDay } from "date-fns";
import TableSkeleton from "@/app/manage/orders/table-skeleton";
import { Toaster } from "@/components/ui/sonner";
import { GuestCreateOrdersResType } from "@/schemaValidations/guest.schema";
import { useGetOrderList, useUpdateOrderMutation } from "@/queries/useOrder";
import { useTableList } from "@/queries/useTable";
import { toast } from "sonner";
import { useAppStore } from "@/components/app-provider";

export const OrderTableContext = createContext({
  // Hàm để cập nhật id đơn hàng cần chỉnh sửa
  setOrderIdEdit: (value: number | undefined) => {},
  // Giá trị id đơn hàng hiện tại cần chỉnh sửa
  orderIdEdit: undefined as number | undefined,
  // Hàm để thay đổi trạng thái của đơn hàng (với dish cụ thể và số lượng)
  changeStatus: (payload: {
    orderId: number;
    dishId: number;
    status: (typeof OrderStatusValues)[number];
    quantity: number;
  }) => {},
  // Dữ liệu đơn hàng được group theo GuestID
  orderObjectByGuestId: {} as OrderObjectByGuestID,
});

// Định nghĩa type cho object đếm số lượng theo trạng thái đơn hàng
// StatusCountObject sẽ là một đối tượng mà các key là các giá trị của OrderStatusValues và mỗi key đó sẽ có giá trị là một số (number).
export type StatusCountObject = Record<
  (typeof OrderStatusValues)[number],
  number
>;

// Định nghĩa type cho các số liệu thống kê của đơn hàng
export type Statics = {
  status: StatusCountObject;
  table: Record<number, Record<number, StatusCountObject>>;
};
// ví dụ về Statics
/*
  const status = {
  pending: 5,
  confirmed: 10,
  cancelled: 2,
}
 */
/*
const table = {
  1: { // Bàn số 1
    101: { pending: 2, confirmed: 1, cancelled: 0 }, // Khách/mã nhóm 101
    102: { pending: 3, confirmed: 0, cancelled: 0 }  // Khách/mã nhóm 102
  },
  2: { // Bàn số 2
    201: { pending: 1, confirmed: 4, cancelled: 0 }
  }
} */

// Định nghĩa type cho object đơn hàng theo GuestID - nó là 1 object có key là guestId và value là 1 mảng các object đơn hàng
export type OrderObjectByGuestID = Record<number, GetOrdersResType["data"]>;

// Định nghĩa type cho object phục vụ khách theo số bàn - nó là 1 object có key là số bàn và value là 1 object chứa các guest
export type ServingGuestByTableNumber = Record<number, OrderObjectByGuestID>;

// Đặt hằng số kích thước trang mặc định
const PAGE_SIZE = 10;
// Khởi tạo ngày bắt đầu và kết thúc mặc định theo ngày hiện tại
const initFromDate = startOfDay(
  new Date(new Date().setMonth(new Date().getMonth() - 2))
);
const initToDate = endOfDay(new Date());

// Component chính hiển thị bảng đơn hàng
export default function OrderTable() {
  const socket = useAppStore((state) => state.socket);
  // Lấy tham số truy vấn từ URL (ví dụ: ?page=2)
  const searchParam = useSearchParams();

  // State để điều khiển mở/đóng bộ lọc trạng thái đơn hàng
  const [openStatusFilter, setOpenStatusFilter] = useState(false);
  // State cho ngày bắt đầu lọc
  const [fromDate, setFromDate] = useState(initFromDate);
  // State cho ngày kết thúc lọc
  const [toDate, setToDate] = useState(initToDate);

  // Lấy số trang hiện tại từ URL, nếu không có thì mặc định là 1
  const page = searchParam.get("page") ? Number(searchParam.get("page")) : 1;
  const pageIndex = page - 1; // chuyển đổi sang chỉ số bắt đầu từ 0

  // State lưu id đơn hàng cần chỉnh sửa (khi người dùng click vào sửa đơn hàng)
  const [orderIdEdit, setOrderIdEdit] = useState<number | undefined>();
  // Giả sử orderList và tableList sẽ được fetch từ API hoặc service sau này
  const orderListQuery = useGetOrderList({ fromDate, toDate });
  const refetchOrderList = orderListQuery.refetch;
  const orderList = orderListQuery.data?.payload.data ?? [];
  const tableListQuery = useTableList();
  const tableList = tableListQuery.data?.payload.data ?? [];
  // Sắp xếp danh sách bàn theo số bàn tăng dần
  const tableListSortedByNumber = tableList.sort((a, b) => a.number - b.number);

  // Các state liên quan đến bộ lọc, sắp xếp, ẩn/hiện cột và chọn hàng của bảng
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // State quản lý phân trang cho bảng (số trang và kích thước trang)
  const [pagination, setPagination] = useState({
    pageIndex, // Giá trị ban đầu của trang (được lấy từ URL)
    pageSize: PAGE_SIZE, // Số lượng bản ghi hiển thị trên mỗi trang
  });

  // Gọi service để lấy dữ liệu thống kê đơn hàng và phân nhóm đơn hàng theo khách hàng
  const { statics, orderObjectByGuestId, servingGuestByTableNumber } =
    useOrderService(orderList);

  const updateOrderMutation = useUpdateOrderMutation();

  // Hàm xử lý thay đổi trạng thái đơn hàng
  const changeStatus = async (body: {
    orderId: number; // id của order
    dishId: number;
    status: (typeof OrderStatusValues)[number];
    quantity: number;
  }) => {
    try {
      await updateOrderMutation.mutateAsync(body);
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
    // TODO: Triển khai xử lý thay đổi trạng thái đơn hàng (gọi API, xử lý lỗi, cập nhật UI,...)
  };

  // Khởi tạo bảng đơn hàng sử dụng hook useReactTable của tanstack/react-table
  const table = useReactTable({
    data: orderList, // Dữ liệu đơn hàng
    columns: orderTableColumns, // Các cột được định nghĩa ở file order-table-columns
    // Thiết lập các hàm callback cập nhật state khi có thay đổi
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    // Lấy các row model cơ bản của bảng
    getCoreRowModel: getCoreRowModel(),
    // Hỗ trợ phân trang
    getPaginationRowModel: getPaginationRowModel(),
    // Hỗ trợ sắp xếp
    getSortedRowModel: getSortedRowModel(),
    // Hỗ trợ lọc dữ liệu theo cột
    getFilteredRowModel: getFilteredRowModel(),
    // Callback thay đổi hiển thị các cột
    onColumnVisibilityChange: setColumnVisibility,
    // Callback thay đổi chọn hàng
    onRowSelectionChange: setRowSelection,
    // Callback thay đổi phân trang
    onPaginationChange: setPagination,
    // Không reset lại trang khi dữ liệu thay đổi
    autoResetPageIndex: false,
    // State quản lý các thao tác của bảng
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  // useEffect cập nhật lại trạng thái phân trang mỗi khi pageIndex thay đổi
  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE,
    });
  }, [table, pageIndex]);

  // Hàm reset bộ lọc ngày về giá trị mặc định ban đầu
  const resetDateFilter = () => {
    setFromDate(initFromDate);
    setToDate(initToDate);
  };
  useEffect(() => {
    if (socket?.connected) {
      onConnect();
    }
    function onConnect() {
      console.log(socket?.id);
    }

    function onDisconnect() {
      console.log("disconnect");
    }

    function refetch() {
      const now = new Date();
      if (now >= fromDate && now <= toDate) {
        refetchOrderList();
      }
    }

    function onUpdateOrder(data: UpdateOrderResType["data"]) {
      console.log(data);
      refetch();
      toast(
        `Món ${data.dishSnapshot.name} (SL: ${
          data.quantity
        }) vừa được cập nhật sang trạng thái ${getVietnameseOrderStatus(
          data.status
        )}`,
        {
          action: {
            label: "Ẩn",
            onClick: () => console.log("Undo"),
          },
        }
      );
    }

    function onNewOrder(data: GuestCreateOrdersResType["data"]) {
      const { guest } = data[0];
      toast(
        `${guest?.name} tại bàn ${guest?.tableNumber} vừa đặt ${data.length} đơn`,
        {
          action: {
            label: "Ẩn",
            onClick: () => console.log("Undo"),
          },
        }
      );
      refetch();
    }

    function onPayment(data: PayGuestOrdersResType["data"]) {
      const { guest } = data[0];
      toast(
        `${guest?.name} tại bàn ${guest?.tableNumber} vừa thanh toán ${data.length} đơn`,
        {
          action: {
            label: "Ẩn",
            onClick: () => console.log("Undo"),
          },
        }
      );
      refetch();
    }

    socket?.on("update-order", onUpdateOrder);
    socket?.on("new-order", onNewOrder);
    socket?.on("payment", onPayment);

    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);

    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("update-order", onUpdateOrder);
      socket?.off("new-order", onNewOrder);
      socket?.off("paym123ent", onPayment);
    };
  }, [refetchOrderList, fromDate, toDate, socket]);
  return (
    // Sử dụng Suspense để hỗ trợ lazy loading cho các component con
    <Suspense>
      {/* Cung cấp context cho các component con trong bảng */}
      <OrderTableContext.Provider
        value={{
          orderIdEdit,
          setOrderIdEdit,
          changeStatus,
          orderObjectByGuestId,
        }}>
        <div className="w-full">
          {/* Component EditOrder để chỉnh sửa đơn hàng; id và hàm setId được truyền qua context */}
          <EditOrder
            id={orderIdEdit}
            setId={setOrderIdEdit}
            onSubmitSuccess={() => {}}
          />

          {/* Phần header chứa bộ lọc theo ngày và nút tạo đơn hàng */}
          <div className="md:flex items-center ">
            <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
              {/* Bộ lọc "Từ ngày" */}
              <div className="flex items-center">
                <span className="mr-2">Từ</span>
                <Input
                  type="datetime-local"
                  placeholder="Từ ngày"
                  // Định dạng giá trị ngày thành dạng datetime-local
                  value={format(fromDate, "yyyy-MM-dd HH:mm").replace(" ", "T")}
                  // Cập nhật state fromDate khi người dùng thay đổi
                  onChange={(event) =>
                    setFromDate(new Date(event.target.value))
                  }
                />
              </div>
              {/* Bộ lọc "Đến ngày" */}
              <div className="flex items-center">
                <span className="mr-2">Đến</span>
                <Input
                  type="datetime-local"
                  placeholder="Đến ngày"
                  value={format(toDate, "yyyy-MM-dd HH:mm").replace(" ", "T")}
                  onChange={(event) => setToDate(new Date(event.target.value))}
                />
              </div>
              {/* Nút reset bộ lọc ngày về mặc định */}
              <Button
                className=""
                variant={"outline"}
                onClick={resetDateFilter}>
                Reset
              </Button>
            </div>
            {/* Nút thêm đơn hàng, căn lề phải */}
            <div className="ml-auto">
              <AddOrder />
            </div>
          </div>

          {/* Phần bộ lọc bổ sung cho tên khách và số bàn */}
          <div className="flex flex-wrap justify-between md:justify-start items-center gap-4 py-4">
            {/* Input lọc theo tên khách hàng */}
            <Input
              placeholder="Tên khách"
              value={
                (table.getColumn("guestName")?.getFilterValue() as string) ?? ""
              }
              // Khi thay đổi, cập nhật giá trị filter cho cột 'guestName'
              onChange={(event) =>
                table.getColumn("guestName")?.setFilterValue(event.target.value)
              }
              className="max-w-[120px]"
            />
            {/* Input lọc theo số bàn */}
            <Input
              placeholder="Số bàn"
              value={
                (table.getColumn("tableNumber")?.getFilterValue() as string) ??
                ""
              }
              // Khi thay đổi, cập nhật giá trị filter cho cột 'tableNumber'
              onChange={(event) =>
                table
                  .getColumn("tableNumber")
                  ?.setFilterValue(event.target.value)
              }
              className="max-w-[80px]"
            />
            {/* Bộ lọc theo trạng thái đơn hàng sử dụng Popover */}
            <Popover open={openStatusFilter} onOpenChange={setOpenStatusFilter}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openStatusFilter}
                  className="w-[150px] text-sm justify-between">
                  {/* Hiển thị trạng thái hiện tại nếu có filter, ngược lại hiển thị "Trạng thái" */}
                  {table.getColumn("status")?.getFilterValue()
                    ? getVietnameseOrderStatus(
                        table
                          .getColumn("status")
                          ?.getFilterValue() as (typeof OrderStatusValues)[number]
                      )
                    : "Trạng thái"}
                  {/* Icon chỉ báo cho phép sắp xếp */}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandGroup>
                    <CommandList>
                      {/* Lặp qua các giá trị trạng thái đơn hàng để hiển thị danh sách lựa chọn */}
                      {OrderStatusValues.map((status) => (
                        <CommandItem
                          key={status}
                          value={status}
                          onSelect={(currentValue) => {
                            // Cập nhật filter trạng thái: nếu trạng thái được chọn trùng với giá trị hiện tại thì reset filter
                            table
                              .getColumn("status")  
                              ?.setFilterValue(
                                currentValue ===
                                  table.getColumn("status")?.getFilterValue()
                                  ? ""
                                  : currentValue
                              );
                            // Đóng Popover sau khi chọn
                            setOpenStatusFilter(false);
                          }}>
                          {/* Icon Check hiển thị nếu trạng thái hiện tại đang được filter */}
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              table.getColumn("status")?.getFilterValue() ===
                                status
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {getVietnameseOrderStatus(status)}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Component hiển thị các số liệu thống kê đơn hàng */}
          <OrderStatics
            statics={statics}
            tableList={tableListSortedByNumber}
            servingGuestByTableNumber={servingGuestByTableNumber}
          />
          {/* Có thể sử dụng TableSkeleton để hiển thị loading state */}
          {orderListQuery.isPending && <TableSkeleton />}
          {!orderListQuery.isPending && (
            <div className="rounded-md border">
              <Table>
                {/* Phần header của bảng */}
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        // Kiểm tra nếu header thuộc các cột cần ẩn trên mobile
                        const hideOnMobile = ["orderHandlerName"].includes(
                          header.column.id
                        );
                        return (
                          <TableHead
                            key={header.id}
                            className={
                              hideOnMobile ? "hidden md:table-cell" : ""
                            }>
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
                {/* Phần body của bảng */}
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}>
                        {row.getVisibleCells().map((cell) => {
                          // Kiểm tra nếu cell thuộc các cột cần ẩn trên mobile
                          const hideOnMobile = ["orderHandlerName"].includes(
                            cell.column.id
                          );
                          return (
                            <TableCell
                              key={cell.id}
                              className={
                                hideOnMobile ? "hidden md:table-cell" : ""
                              }>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={orderTableColumns.length}
                        className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Bảng đơn hàng hiển thị dữ liệu */}

          {/* Phần phân trang hiển thị số lượng kết quả và component AutoPagination */}
          <div className="flex items-center justify-end space-x-2 py-4">
            {/* Hiển thị số lượng kết quả hiện tại và tổng số kết quả */}
            <div className="text-xs text-muted-foreground py-4 flex-1 ">
              Hiển thị{" "}
              <strong>{table.getPaginationRowModel().rows.length}</strong> trong{" "}
              <strong>{orderList.length}</strong> kết quả
            </div>
            <div>
              {/* Component phân trang tự động, chuyển trang dựa trên trạng thái phân trang của bảng */}
              <AutoPagination
                page={table.getState().pagination.pageIndex + 1}
                pageSize={table.getPageCount()}
                pathname="/manage/orders"
              />
            </div>
          </div>
        </div>
      </OrderTableContext.Provider>
    </Suspense>
  );
}
