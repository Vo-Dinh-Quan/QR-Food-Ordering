"use client"; // Directive này cho Next.js biết rằng file này là một Client Component, nghĩa là code sẽ chạy ở phía trình duyệt (client-side)

import { Button } from "@/components/ui/button";
// Import các component UI như Button, Dialog, Input, Label, Avatar,... từ các thư mục tương ứng
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreateEmployeeAccountBody,
  CreateEmployeeAccountBodyType,
} from "@/schemaValidations/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAddAccountMutation } from "@/queries/useAccount";
import { useUploadMediaMutation } from "@/queries/useMedia";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/utils";

// Component AddEmployee để tạo mới tài khoản nhân viên
export default function AddEmployee() {
  // State lưu trữ file ảnh được upload, kiểu File hoặc null khi chưa có file
  const [file, setFile] = useState<File | null>(null);
  // State quản lý trạng thái mở/đóng của hộp thoại (Dialog)
  const [open, setOpen] = useState(false);

  const addAccountMutation = useAddAccountMutation();
  const uploadMediaMutation = useUploadMediaMutation();

  // useRef để tham chiếu đến input file ẩn, cho phép kích hoạt click thông qua nút tùy chỉnh
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Khởi tạo form sử dụng react-hook-form với kiểu dữ liệu CreateEmployeeAccountBodyType
  // Sử dụng zodResolver để xác thực dữ liệu theo schema CreateEmployeeAccountBody
  const form = useForm<CreateEmployeeAccountBodyType>({
    resolver: zodResolver(CreateEmployeeAccountBody),
    defaultValues: {
      name: "", // Giá trị mặc định cho trường tên
      email: "", // Giá trị mặc định cho trường email
      avatar: undefined, // Giá trị mặc định cho trường avatar (chưa có giá trị)
      password: "", // Giá trị mặc định cho trường mật khẩu
      confirmPassword: "", // Giá trị mặc định cho trường xác nhận mật khẩu
    },
  });

  // Sử dụng form.watch để theo dõi các giá trị của field 'avatar' và 'name'
  const avatar = form.watch("avatar");
  const name = form.watch("name");

  // Sử dụng useMemo để tạo ra URL preview cho avatar:
  // - Nếu có file được chọn, sử dụng URL tạm thời tạo từ file đó
  // - Nếu không, sử dụng giá trị avatar từ form (có thể là URL đã có từ trước)
  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return avatar;
  }, [file, avatar]);

  const reset = () => {
    form.reset();
    setFile(null);
  };

  const onSubmit = async (values: CreateEmployeeAccountBodyType) => {
    // Nếu mutation đang chờ xử lý, không làm gì thêm
    if (addAccountMutation.isPending) return;
    try {
      let body = values;
      // Nếu có file mới được chọn, cần upload file trước
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        // Sử dụng mutateAsync để upload file, giúp sử dụng cú pháp async/await
        const uploadImageResult = await uploadMediaMutation.mutateAsync(
          formData
        );
        const imageUrl = uploadImageResult.payload.data;
        // Sau khi upload thành công, cập nhật lại giá trị avatar trong body
        body = {
          ...values,
          avatar: imageUrl,
        };
      }
      // Gọi mutation để cập nhật thông tin cá nhân với dữ liệu đã xử lý
      const response = await addAccountMutation.mutateAsync(body);
      // Hiển thị thông báo thành công cho người dùng
      toast(response.payload.message, {
        action: {
          label: "Ẩn",
          onClick: () => console.log("Undo"),
        },
      });
      reset();
      setOpen(false);
    } catch (error) {
      // Xử lý lỗi từ API, set lỗi lên form nếu có
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };

  return (
    // Sử dụng component Dialog để hiển thị hộp thoại tạo tài khoản
    <Dialog onOpenChange={setOpen} open={open}>
      {/* DialogTrigger: Phần giao diện kích hoạt mở Dialog, ở đây là một Button */}
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          {/* Sử dụng sr-only để ẩn text khỏi giao diện nhưng vẫn cho screen reader */}
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Tạo tài khoản
          </span>
        </Button>
      </DialogTrigger>

      {/* DialogContent chứa nội dung chính của Dialog */}
      <DialogContent className="sm:max-w-[600px] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>Tạo tài khoản</DialogTitle>
          <DialogDescription>
            Các trường tên, email, mật khẩu là bắt buộc
          </DialogDescription>
        </DialogHeader>

        {/* Gói toàn bộ form bên trong component Form, cung cấp context của react-hook-form */}
        <Form {...form}>
          {/* Form element với thuộc tính noValidate để tắt HTML native validation */}
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="add-employee-form"
            onSubmit={form.handleSubmit(onSubmit, (e) => {
              console.log(e);
            })}>
            <div className="grid gap-4 py-4">
              {/* FormField cho trường avatar */}
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
                      {/* Hiển thị avatar, sử dụng previewAvatarFromFile để hiển thị ảnh đã chọn hoặc URL avatar */}
                      <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                        <AvatarImage
                          src={previewAvatarFromFile}
                          className="object-cover"
                        />
                        {/* Nếu không có ảnh, hiển thị fallback với tên hoặc chữ 'Avatar' */}
                        <AvatarFallback className="rounded-none">
                          {name || "Avatar"}
                        </AvatarFallback>
                      </Avatar>
                      {/* Input file ẩn dùng để upload ảnh */}
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Cập nhật state file với file được chọn
                            setFile(file);
                            // Gọi hàm onChange của field để cập nhật giá trị avatar trong form
                            // Ở đây đang sử dụng URL mẫu, có thể thay đổi theo logic upload thực tế
                            field.onChange(
                              "http://localhost:3000/" + file.name
                            );
                          }
                        }}
                        className="hidden"
                      />
                      {/* Nút để kích hoạt input file ẩn */}
                      <button
                        className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}>
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              {/* FormField cho trường tên */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      {/* Label cho trường tên */}
                      <Label htmlFor="name">Tên</Label>
                      <div className="col-span-3 w-full space-y-2">
                        {/* Input để nhập tên, các props của field được truyền vào Input */}
                        <Input id="name" className="w-full" {...field} />
                        {/* Hiển thị thông báo lỗi khi dữ liệu không hợp lệ */}
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* FormField cho trường email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="email">Email</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="email" className="w-full" {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* FormField cho trường mật khẩu */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="password">Mật khẩu</Label>
                      <div className="col-span-3 w-full space-y-2">
                        {/* Input với type password để ẩn mật khẩu */}
                        <Input
                          id="password"
                          className="w-full"
                          type="password"
                          {...field}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* FormField cho trường xác nhận mật khẩu */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="confirmPassword"
                          className="w-full"
                          type="password"
                          {...field}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        {/* DialogFooter chứa nút submit để gửi form */}
        <DialogFooter>
          {/* Nút submit liên kết với form thông qua thuộc tính form, với id là 'add-employee-form' */}
          <Button type="submit" form="add-employee-form">
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
