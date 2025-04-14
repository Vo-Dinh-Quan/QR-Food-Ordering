import Link from "next/link";
import Image from "next/image";
import { Menu, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import DarkModeToggle from "@/components/dark-mode-toggle";
import NavItems from "@/app/(public)/nav-items";

export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col relative">
      <header className="sticky top-0 z-20 grid grid-cols-3 items-center border-b bg-background px-4 md:px-6 h-16">
        {/* Left: Navigation & Mobile Sheet */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="sr-only">
                <SheetTitle />
              </SheetHeader>
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold">
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">Big boy</span>
                </Link>
                <NavItems className="text-muted-foreground transition-colors hover:text-foreground" />
              </nav>
            </SheetContent>
          </Sheet>
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold md:text-base">
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Big boy</span>
            </Link>
            <NavItems className="text-muted-foreground transition-colors hover:text-foreground flex-shrink-0" />
          </nav>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/bin-restaurant_logo_black.svg"
              alt="Logo"
              width={40}
              height={40}
              className="block dark:hidden"
            />
            <Image
              src="/bin-restaurant_logo_white.svg"
              alt="Logo"
              width={40}
              height={40}
              className="hidden dark:block"
            />
          </Link>
        </div>

        {/* Right: Dark Mode Toggle */}
        <div className="flex items-center justify-end">
          <DarkModeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
        {modal}
      </main>
    </div>
  );
}
