"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui";

// ponytail: "Tải PDF" = hộp thoại in của trình duyệt (Lưu thành PDF); xuất PDF server khi có BE
export function PrintButton({ label = "Tải kết quả PDF", variant = "navy" }: { label?: string; variant?: "navy" | "outline" }) {
  return (
    <Button variant={variant} onClick={() => window.print()} className="print:hidden">
      <Download className="size-5" aria-hidden />
      {label}
    </Button>
  );
}
