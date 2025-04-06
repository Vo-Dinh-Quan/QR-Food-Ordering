"use client";

import { getTableLink } from "@/lib/utils";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

export default function QRCodeTable({
  token,
  tableNumber,
}: {
  token: string;
  tableNumber: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrWidth, setQrWidth] = useState(200); // Default desktop size

  // Responsive width detection
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setQrWidth(100); // mobile width
      } else {
        setQrWidth(200); // desktop width
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize); // Listen on resize

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.height = qrWidth + 40;
    canvas.width = qrWidth;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 15px Inter";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.fillText(`Bàn số ${tableNumber}`, canvas.width / 2, qrWidth + 15);
    ctx.fillText(`Quét mã QR để gọi món`, canvas.width / 2, qrWidth + 30);

    const virtualCanvas = document.createElement("canvas");

    QRCode.toCanvas(
      virtualCanvas,
      getTableLink({ token, tableNumber }),
      { width: qrWidth, margin: 2 },
      (error) => {
        if (error) console.error(error);
        ctx.drawImage(virtualCanvas, 0, 0, qrWidth, qrWidth);
      }
    );
  }, [token, tableNumber, qrWidth]);

  return <canvas ref={canvasRef} className="font-semibold" />;
}

// note:  Dùng hook useMediaQuery để tự động đổi width tối ưu responsive trên mobile
