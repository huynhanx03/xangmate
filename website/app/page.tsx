import { XangMateCalculator } from "@/components/xangmate-calculator";

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-6 md:py-10">
      <XangMateCalculator />

      {/* Footer */}
      <footer className="mt-12 border-t py-6 text-center text-xs text-muted-foreground">
        <p>
          XangMate — Công cụ tính chi phí xăng dầu tại Việt Nam
        </p>
        <p className="mt-1">
          Dữ liệu giá xăng từ{" "}
          <a
            href="https://www.pvoil.com.vn/tin-gia-xang-dau"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            PVOIL
          </a>
          . Thông số xe mang tính tham khảo.
        </p>
      </footer>
    </main>
  );
}
