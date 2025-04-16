"use client";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

import React, { useState } from "react";

export default function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) router.back();
      }}>
      <DialogContent className="w-full max-w-3xl p-4 sm:p-6 lg:p-8">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold sm:text-xl lg:text-2xl">
            Chi tiết món ăn
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-auto max-h-[80vh]">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
