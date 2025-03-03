"use client"; // Đây là directive cho Next.js cho biết file này sẽ được chạy ở phía client (trình duyệt)

import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
// Import các icon cần dùng trong giao diện

// Import các hàm và kiểu dữ liệu từ thư viện @tanstack/react-table để xây dựng bảng
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

import { Button } from "@/components/ui/button"; // Import component Button từ thư mục UI

// Import các component dropdown-menu từ thư mục UI, dùng để hiển thị menu hành động (actions)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input"; // Component Input dùng cho bộ lọc (filter)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Các component cho bảng
import {
  AccountListResType,
  AccountType,
} from "@/schemaValidations/account.schema"; // Kiểu dữ liệu của tài khoản
import AddEmployee from "@/app/manage/accounts/add-employee"; // Component thêm nhân viên mới
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Component hiển thị ảnh đại diện
import EditEmployee from "@/app/manage/accounts/edit-employee"; // Component sửa thông tin nhân viên
import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react"; // Các hook và hàm từ React

// Import các component dialog cảnh báo để xác nhận xóa tài khoản
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
import { useSearchParams } from "next/navigation"; // Hook lấy query params từ URL của Next.js
import AutoPagination from "@/components/auto-pagination"; // Component tự động phân trang
import {
  useDeleteAccountMutation,
  useGetAccountList,
} from "@/queries/useAccount";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/utils";

// Định nghĩa kiểu dữ liệu cho một item tài khoản, dựa theo dữ liệu trả về từ API
type AccountItem = AccountListResType["data"][0];

// Tạo một context dùng để chia sẻ trạng thái và hàm cập nhật giữa các component bên trong bảng
// Phần <{}> ngay sau createContext là kiểu dữ liệu mặc định cho context mà nó sẽ chứa.
// Cụ thể hơn, nó gồm 4 thuộc tính: setEmployeeIdEdit, employeeIdEdit, employeeDelete, setEmployeeDelete
const AccountTableContext = createContext<{
  setEmployeeIdEdit: (value: number) => void;
  employeeIdEdit: number | undefined;
  employeeDelete: AccountItem | null;
  setEmployeeDelete: (value: AccountItem | null) => void;
}>({
  // Giá trị mặc định cho context (chỉ dùng khi không có Provider bao bọc)
  setEmployeeIdEdit: (value: number | undefined) => {},
  employeeIdEdit: undefined,
  employeeDelete: null,
  setEmployeeDelete: (value: AccountItem | null) => {},
});

// Định nghĩa các cột của bảng sử dụng thư viện @tanstack/react-table
export const columns: ColumnDef<AccountType>[] = [
  {
    id: "stt",
    header: "STT",
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "id", // Lấy dữ liệu từ thuộc tính 'id' của đối tượng Account
    header: "ID", // Tiêu đề cột
  },
  {
    accessorKey: "avatar", // Cột hiển thị avatar của nhân viên
    header: "Avatar",
    cell: ({ row }) => (
      <div>
        {/* Sử dụng component Avatar để hiển thị ảnh đại diện */}
        <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
          <AvatarImage src={row.getValue("avatar")} className="object-cover" />
          {/* Nếu không load được ảnh, hiển thị fallback là tên của nhân viên */}
          <AvatarFallback className="rounded-none">
            {row.original.name}
          </AvatarFallback>
        </Avatar>
      </div>
    ),
  },
  {
    accessorKey: "name", // Cột hiển thị tên nhân viên
    header: "Tên",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email", // Cột hiển thị email của nhân viên
    // Tiêu đề cột là một Button cho phép sắp xếp theo email khi bấm vào
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Email
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions", // Cột hành động không dựa trên dữ liệu cụ thể trong đối tượng Account
    enableHiding: false, // Không cho phép ẩn cột này
    cell: function Actions({ row }) {
      // Lấy các hàm cập nhật từ context để xử lý sửa và xóa nhân viên
      const { setEmployeeIdEdit, setEmployeeDelete } =
        useContext(AccountTableContext);
      // Hàm mở form sửa thông tin nhân viên
      const openEditEmployee = () => {
        setEmployeeIdEdit(row.original.id);
      };

      // Hàm mở dialog xác nhận xóa nhân viên
      const openDeleteEmployee = () => {
        setEmployeeDelete(row.original);
      };
      return (
        // Sử dụng DropdownMenu của UI component để hiển thị các hành động cho mỗi dòng
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
            <DropdownMenuItem onClick={openEditEmployee}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteEmployee}>
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Component AlertDialogDeleteAccount hiển thị hộp thoại cảnh báo xác nhận xóa nhân viên
function AlertDialogDeleteAccount({
  employeeDelete,
  setEmployeeDelete,
}: {
  employeeDelete: AccountItem | null;
  setEmployeeDelete: (value: AccountItem | null) => void;
}) {
  const { mutateAsync } = useDeleteAccountMutation();
  const deleteAccount = async () => {
    if (employeeDelete) {
      try {
        const response = await mutateAsync(employeeDelete.id);
        setEmployeeDelete(null);
        toast(response.payload.message, {
          action: {
            label: "Ẩn",
            onClick: () => console.log("Undo"),
          },
        });
      } catch (error) {
        handleErrorApi({
          error,
        })
      }
    }
  };

  return (
    <AlertDialog
      open={Boolean(employeeDelete)} // Nếu có giá trị employeeDelete thì mở dialog
      onOpenChange={(value) => {
        // onOpenChange sẽ được gọi khi dialog nhấn Cancel
        // Khi đóng dialog, đặt lại employeeDelete về null
        if (!value) {
          setEmployeeDelete(null);
        }
      }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa nhân viên?</AlertDialogTitle>
          <AlertDialogDescription>
            Tài khoản{" "}
            <span className="bg-foreground text-primary-foreground rounded px-1">
              {employeeDelete?.name}
            </span>{" "}
            sẽ bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteAccount}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Số lượng item hiển thị trên 1 trang (cho phân trang)
const PAGE_SIZE = 5;

// Component chính hiển thị bảng tài khoản
export default function AccountTable() {
  // Lấy query params từ URL (dùng cho phân trang)
  const searchParam = useSearchParams();
  // Lấy giá trị 'page' từ URL, nếu không có mặc định là trang 1
  const page = searchParam.get("page") ? Number(searchParam.get("page")) : 1;
  const pageIndex = page - 1; // Vì chỉ số trang bắt đầu từ 0 trong react-table

  // Khởi tạo state cho id nhân viên cần sửa (edit) và nhân viên cần xóa (delete)
  const [employeeIdEdit, setEmployeeIdEdit] = useState<number | undefined>();
  const [employeeDelete, setEmployeeDelete] = useState<AccountItem | null>(
    null
  );
  // Data hiển thị bảng, hiện tại đang rỗng, có thể được thay thế bằng dữ liệu fetch từ API

  const accountListQuery = useGetAccountList();
  const data = accountListQuery.data?.payload.data ?? [];

  // Các state quản lý trạng thái sắp xếp, lọc cột, ẩn hiện cột và lựa chọn dòng
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  // State quản lý phân trang với chỉ số trang và số lượng item trên 1 trang
  const [pagination, setPagination] = useState({
    pageIndex, // Giá trị ban đầu lấy từ query params
    pageSize: PAGE_SIZE, // Số lượng item mỗi trang
  });

  // Cấu hình bảng với các state, cột và các hàm xử lý từ thư viện react-table
  const table = useReactTable({
    data, // Dữ liệu cho bảng
    columns, // Các định nghĩa cột
    onSortingChange: setSorting, // Hàm cập nhật khi sắp xếp thay đổi
    onColumnFiltersChange: setColumnFilters, // Hàm cập nhật khi bộ lọc thay đổi
    getCoreRowModel: getCoreRowModel(), // Hàm tạo row model cơ bản
    getPaginationRowModel: getPaginationRowModel(), // Hàm xử lý phân trang
    getSortedRowModel: getSortedRowModel(), // Hàm xử lý sắp xếp
    getFilteredRowModel: getFilteredRowModel(), // Hàm xử lý lọc dữ liệu
    onColumnVisibilityChange: setColumnVisibility, // Hàm cập nhật khi hiển thị/ẩn cột thay đổi
    onRowSelectionChange: setRowSelection, // Hàm cập nhật khi lựa chọn dòng thay đổi
    onPaginationChange: setPagination, // Hàm cập nhật khi phân trang thay đổi
    autoResetPageIndex: false, // Không tự động reset chỉ số trang khi dữ liệu thay đổi
    state: {
      // Truyền các state hiện tại cho bảng
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  // useEffect dùng để cập nhật lại trạng thái phân trang của bảng khi pageIndex thay đổi
  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE,
    });
  }, [table, pageIndex]);

  return (
    // Sử dụng Suspense để xử lý các component tải dữ liệu bất đồng bộ
    <Suspense>
      {/* Cung cấp context cho các component con sử dụng trong bảng */}
      <AccountTableContext.Provider
        value={{
          employeeIdEdit,
          setEmployeeIdEdit,
          employeeDelete,
          setEmployeeDelete,
        }}>
        <div className="w-full">
          {/* Component sửa nhân viên: sẽ hiển thị khi employeeIdEdit có giá trị */}
          <EditEmployee
            id={employeeIdEdit}
            setId={setEmployeeIdEdit}
            onSubmitSuccess={() => {}}
          />
          {/* Component dialog xác nhận xóa nhân viên */}
          <AlertDialogDeleteAccount
            employeeDelete={employeeDelete}
            setEmployeeDelete={setEmployeeDelete}
          />
          {/* Phần tìm kiếm (filter) theo email */}
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter emails..."
              // Lấy giá trị filter của cột email từ bảng, nếu không có thì trả về chuỗi rỗng
              value={
                (table.getColumn("email")?.getFilterValue() as string) ?? ""
              }
              // Khi nhập text, cập nhật giá trị filter cho cột email
              onChange={(event) =>
                table.getColumn("email")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            {/* Nút thêm nhân viên, nằm bên phải */}
            <div className="ml-auto flex items-center gap-2">
              <AddEmployee />
            </div>
          </div>
          {/* Hiển thị bảng trong một container có viền và bo góc */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {/* Duyệt qua các header group được tạo bởi react-table */}
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {/* Nếu header không phải là placeholder, render nội dung header */}
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
                {/* Kiểm tra nếu có dữ liệu để hiển thị */}
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
                  // Nếu không có dữ liệu, hiển thị dòng thông báo
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
          {/* Phần điều khiển phân trang */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-xs text-muted-foreground py-4 flex-1 ">
              {/* Hiển thị số kết quả trên trang và tổng số kết quả */}
              Hiển thị{" "}
              <strong>
                {table.getPaginationRowModel().rows.length}
              </strong> trong <strong>{data.length}</strong> kết quả
            </div>
            <div>
              {/* Component phân trang tự động */}
              <AutoPagination
                page={table.getState().pagination.pageIndex + 1}
                pageSize={table.getPageCount()}
                pathname="/manage/accounts"
              />
            </div>
          </div>
        </div>
      </AccountTableContext.Provider>
    </Suspense>
  );
}
