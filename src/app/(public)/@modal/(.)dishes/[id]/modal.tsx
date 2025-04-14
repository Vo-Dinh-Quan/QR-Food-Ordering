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
      <DialogContent className="w-auto max-w-none">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
