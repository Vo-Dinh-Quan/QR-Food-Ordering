"use client";
import { getTableLink } from "@/lib/utils";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";

export default function QRCodeTable({
  token,
  tableNumber,
  width = 250,
}: {
  token: string;
  tableNumber: number;
  width?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      QRCode.toCanvas(
        canvas,
        getTableLink({
          token: token, 
          tableNumber: tableNumber,
        }),
        (error) => {
          if (error) console.error(error);
        }
      );
    }
  }, [token, tableNumber]);

  return <canvas ref={canvasRef} />;
}
