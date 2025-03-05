"use client";
import { getTableLink } from "@/lib/utils";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";

export default function QRCodeTable({
  token,
  tableNumber,
  width = 200,
}: {
  token: string;
  tableNumber: number;
  width?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // hiện tại thư viện QR Code sẽ vẽ lên thẻ Canvas
    // Bây giờ: Chúng ta sẽ tạo 1 cái thẻ canvas ảo để thư viện QRCode nó vẽ QR lên trên đó. Và chúng ta sẽ edit thẻ canvas thật.
    // Cuối cùng thì chúng ta sẽ đưa cái thẻ canvas ảo chứa QRCode ở trên vào thẻ canvas thật.
    const canvas = canvasRef.current!;
    canvas.height = width + 40;
    canvas.width = width;
    const canvasContext = canvas.getContext("2d")!; // 2d là kiểu vẽ 2 chiều
    canvasContext.fillStyle = "#fff";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height); // tô màu trắng cho canvas từ tọa độ (0,0) đến (canvas.width, canvas.height)
    canvasContext.font = "bold 15px Inter";

    canvasContext.textAlign = "center";
    canvasContext.fillStyle = "#000";
    canvasContext.fillText(
      `Bàn số ${tableNumber}`,
      canvas.width / 2,
      canvas.width + 15
    );
    canvasContext.fillText(
      `Quét mã QR để gọi món`,
      canvas.width / 2,
      canvas.width + 30
    );
    const virtualCanvas = document.createElement("canvas");

    QRCode.toCanvas(
      virtualCanvas,
      getTableLink({
        token: token,
        tableNumber: tableNumber,
      }),{
        width: width,
        margin: 2,
      },
      function (error) {
        if (error) console.error(error);
        canvasContext.drawImage(virtualCanvas, 0, 0, width, width);
      }
    );
  }, [token, tableNumber, width]);

  return <canvas ref={canvasRef} className="font-semibold"/>;
}
