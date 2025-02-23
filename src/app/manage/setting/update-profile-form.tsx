"use client";
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
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { data, refetch } = useAccountMe();
  // với refetch, nó sẽ tự động gọi lại query và lấy data mới nhất từ api. nó sẽ ảnh hưởng đến tất cả các component sử dụng query đó, data sẽ được update cho tất cả component sử dụng nó
  const updateMeMutation = useUpdateMeMutation(); // updateMeMutation bao gồm các trạng thái của mutation như isPending, isSuccess, isError, error, data, reset, mutate
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

  useEffect(() => {
    if (data) {
      const { name, avatar } = data?.payload.data;
      form.reset({
        // Reset lại form với giá trị được get về từ server
        name,
        avatar: avatar ?? undefined,
      });
    }
  }, [data, form]);

  const previewAvatar = useMemo(() => {
    // useMemo giúp ghi nhớ giá trị trả về của hàm callback và chỉ tính toán lại khi một trong các dependencies thay đổi
    if (file) {
      //  Nếu như chưa up file thì sẽ lấy trong avatar được get về
      return URL.createObjectURL(file);
    }
    return avatar;
  }, [file, avatar]);

  const reset = () => {
    form.reset();
    setFile(null);
  };

  const onSubmit = async (values: UpdateMeBodyType) => {
    if (updateMeMutation.isPending) return;
    try {
      let body = values;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        // note: sử dụng mutate thường không trả về promise, sử dụng onSuccess, onSubmit trong option để sử lý kết quả.
        // với mutateAsync cho phép chúng ta sử dụng async
        const uploadImageResult = await uploadMediaMutation.mutateAsync(
          formData
        );
        const imageUrl = uploadImageResult.payload.data;
        body = {
          ...values,
          avatar: imageUrl,
        };
      }
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
        onReset={reset}
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
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={avatarInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFile(file);
                            field.onChange(
                              // fake url (phải là string và là url) để vượt qua schema
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

              <div className=" items-center gap-2 md:ml-auto flex">
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
