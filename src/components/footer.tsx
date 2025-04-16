import { Beef } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full p-4 md:p-8 text-muted-foreground border-t">
      <div className=" flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
          <Link href="/" className="flex items-center gap-2 " prefetch={false}>
            <Beef className="h-6 w-6 hover:text-foreground" />
            <span className="text-sm font-medium">Bin Restaurant</span>
          </Link>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
            <Link
              href="/term-of-service"
              className="hover:underline"
              prefetch={false}>
              Điều khoản dịch vụ
            </Link>
            <Link
              href="/privacy-policy"
              className="hover:underline"
              prefetch={false}>
              Chính sách bảo mật
            </Link>
            <Link href="/about" className="hover:underline" prefetch={false}>
              Về chúng tôi
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://www.facebook.com/vdquan.27/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
            prefetch={false}>
            <svg
              role="img"
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current"
              xmlns="http://www.w3.org/2000/svg">
              <title>Facebook</title>
              <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
            </svg>
            <span className="sr-only">Facebook</span>
          </Link>
          <Link
            href="https://github.com/Vo-Dinh-Quan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
            prefetch={false}>
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 fill-current">
              <title>GitHub</title>
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.76-1.605-2.665-.305-5.466-1.333-5.466-5.93 0-1.31.465-2.382 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.838 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.435.375.81 1.11.81 2.24 0 1.62-.015 2.92-.015 3.32 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <span className="sr-only">GitHub</span>
          </Link>
          <Link
            href="https://www.instagram.com/vdq.27/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
            prefetch={false}>
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 fill-current">
              <title>Instagram</title>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.34 3.608 1.316.975.975 1.254 2.242 1.316 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.34 2.633-1.316 3.608-.975.975-2.242 1.254-3.608 1.316-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.34-3.608-1.316-.975-.975-1.254-2.242-1.316-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.34-2.633 1.316-3.608.975-.975 2.242-1.254 3.608-1.316 1.266-.058 1.646-.07 4.85-.07zm0-2.163C8.756 0 8.332.014 7.052.072 5.773.13 4.548.39 3.5 1.438 2.452 2.486 2.192 3.711 2.134 4.99.014 8.332 0 8.756 0 12s.014 3.668.072 4.948c.058 1.279.318 2.504 1.366 3.552 1.048 1.048 2.273 1.308 3.552 1.366 1.28.058 1.704.072 4.948.072s3.668-.014 4.948-.072c1.279-.058 2.504-.318 3.552-1.366 1.048-1.048 1.308-2.273 1.366-3.552.058-1.28.072-1.704.072-4.948s-.014-3.668-.072-4.948c-.058-1.279-.318-2.504-1.366-3.552-1.048-1.048-2.273-1.308-3.552-1.366C15.668.014 15.244 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0-2.881 1.44 1.44 0 0 0 0 2.881z" />
            </svg>
            <span className="sr-only">Instagram</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
