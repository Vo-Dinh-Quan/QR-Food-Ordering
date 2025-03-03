"use client"; // Cho Next.js biết rằng file này là Client Component (chạy ở trình duyệt)

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  UpdateMeBody,
  UpdateMeBodyType,
} from "@/schemaValidations/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccountMe, useUpdateMeMutation } from "@/queries/useAccount";
import { useUploadMediaMutation } from "@/queries/useMedia";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/utils";

// Component UpdateProfileForm dùng để cập nhật thông tin cá nhân (profile) của người dùng
export default function UpdateProfileForm() {
  // State lưu trữ file được chọn (ảnh) cho avatar; nếu chưa chọn thì giá trị là null
  const [file, setFile] = useState<File | null>(null);
  // useRef dùng để tham chiếu đến input file ẩn, từ đó kích hoạt click thông qua nút bấm tùy chỉnh
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Sử dụng hook để lấy thông tin tài khoản hiện tại từ API
  const { data, refetch } = useAccountMe();
  // useAccountMe trả về thông tin tài khoản, đồng thời refetch để lấy dữ liệu mới nhất khi cần

  // Hook mutation để cập nhật thông tin cá nhân của người dùng
  // updateMeMutation chứa các trạng thái của mutation như isPending, isSuccess, isError, v.v.
  const updateMeMutation = useUpdateMeMutation();
  // Hook mutation để upload file media (ảnh) lên server
  const uploadMediaMutation = useUploadMediaMutation();

  // Khởi tạo form sử dụng react-hook-form với kiểu dữ liệu UpdateMeBodyType
  // zodResolver được sử dụng để xác thực dữ liệu theo schema UpdateMeBody
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: "", // Giá trị mặc định cho trường tên
      avatar: undefined, // Giá trị mặc định cho avatar (chưa có giá trị)
    },
  });

  // Theo dõi giá trị của field 'avatar' và 'name' từ form để sử dụng trong UI
  const avatar = form.watch("avatar");
  const name = form.watch("name");

  // useEffect được sử dụng để reset form với dữ liệu từ server khi data thay đổi
  useEffect(() => {
    if (data) {
      const { name, avatar } = data?.payload.data;
      // Reset lại form với dữ liệu lấy về từ API
      form.reset({
        name,
        avatar: avatar ?? undefined,
      });
    }
  }, [data, form]);

  // useMemo dùng để tạo ra URL preview cho ảnh avatar
  // Nếu người dùng chọn file mới, tạo URL tạm thời từ file đó
  // Nếu không, sử dụng giá trị avatar có sẵn trong form
  const previewAvatar = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return avatar;
  }, [file, avatar]);

  // Hàm reset form: đặt lại form về giá trị mặc định và set file về null
  const reset = () => {
    form.reset();
    setFile(null);
  };

  // Hàm onSubmit để xử lý khi form được submit
  const onSubmit = async (values: UpdateMeBodyType) => {
    // Nếu mutation đang chờ xử lý, không làm gì thêm
    if (updateMeMutation.isPending) return;
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
      const response = await updateMeMutation.mutateAsync(body);
      // Hiển thị thông báo thành công cho người dùng
      toast(response.payload.message, {
        action: {
          label: "Ẩn",
          onClick: () => console.log("Undo"),
        },
      });
      // Gọi refetch để cập nhật dữ liệu mới nhất cho tất cả các component sử dụng query này
      refetch();
    } catch (error) {
      // Xử lý lỗi từ API, set lỗi lên form nếu có
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };

  return (
    // Bọc toàn bộ form trong component Form để cung cấp context cho react-hook-form
    <Form {...form}>
      {/* Form element với noValidate để tắt xác thực mặc định của trình duyệt */}
      <form
        noValidate
        className="grid auto-rows-max items-start gap-4 md:gap-8"
        onReset={reset} // Xử lý khi form được reset
        onSubmit={form.handleSubmit(onSubmit, (e) => {
          // Nếu có lỗi trong việc submit, in log ra console
          console.log(e);
        })}>
        {/* Sử dụng component Card để tạo khung chứa thông tin cập nhật cá nhân */}
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* FormField cho trường avatar */}
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
                      {/* Hiển thị avatar sử dụng previewAvatar: nếu có file được chọn thì hiển thị file đó, nếu không hiển thị avatar có sẵn */}
                      <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                        <AvatarImage
                          className="object-cover"
                          src={previewAvatar}
                        />
                        <AvatarFallback className="rounded-none">
                          {name}
                        </AvatarFallback>
                      </Avatar>
                      {/* Input file ẩn dùng để chọn ảnh */}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={avatarInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Cập nhật state file khi người dùng chọn ảnh mới
                            setFile(file);
                            // Cập nhật giá trị avatar trong form, sử dụng fake URL để vượt qua schema xác thực
                            field.onChange(
                              "http://localhost:3000/" + field.name
                            );
                          }
                        }}
                      />
                      {/* Nút kích hoạt click vào input file ẩn */}
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
                    <div className="grid gap-3">
                      <Label htmlFor="name">Tên</Label>
                      <Input
                        id="name"
                        type="text"
                        className="w-full"
                        {...field}
                      />
                      {/* Hiển thị thông báo lỗi nếu có lỗi xác thực */}
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* Các nút Hủy (reset) và Lưu (submit) */}
              <div className="items-center gap-2 md:ml-auto flex">
                <Button variant="outline" size="sm" type="reset">
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  Lưu thông tin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
