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

export default function UpdateProfileForm() {
  const [file, setFile] = useState<File | null>(null);
  // useRef dùng để tham chiếu đến input file ẩn, từ đó kích hoạt click thông qua nút bấm tùy chỉnh
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { data, refetch } = useAccountMe();
  // useAccountMe trả về thông tin tài khoản, đồng thời refetch để lấy dữ liệu mới nhất khi cần

  const updateMeMutation = useUpdateMeMutation();
  const uploadMediaMutation = useUploadMediaMutation();
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: "",
      avatar: undefined,
    },
  });

  const avatar = form.watch("avatar");
  const name = form.watch("name");

  // useEffect được sử dụng để reset form với dữ liệu từ server khi data thay đổi
  useEffect(() => {
    if (data) {
      const { name, avatar } = data?.payload.data;
      form.reset({
        name,
        avatar: avatar ?? undefined,
      });
    }
  }, [data, form]);

  // useMemo dùng để tạo ra URL preview cho ảnh avatar
  // Nếu người dùng chọn file mới, tạo URL tạm thời từ file đó
  // Nếu không, sử dụng giá trị avatar có sẵn trong form
  const previewAvatar = (() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return avatar;
  })();

  const reset = () => {
    form.reset();
    setFile(null);
  };

  const onSubmit = async (values: UpdateMeBodyType) => {
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
        body = {
          ...values,
          avatar: imageUrl,
        };
      }
      // Gọi mutation để cập nhật thông tin cá nhân với dữ liệu đã xử lý
      const response = await updateMeMutation.mutateAsync(body);
      toast(response.payload.message, {
        action: {
          label: "Ẩn",
          onClick: () => console.log("Undo"),
        },
      });
      refetch();
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid auto-rows-max items-start gap-4 md:gap-8"
        onReset={reset} // Xử lý khi form được reset
        onSubmit={form.handleSubmit(onSubmit, (e) => {
          console.log(e);
        })}>
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
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
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

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
