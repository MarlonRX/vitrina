import Link from "next/link";
import CartButton from "@/components/cart/CartButton";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-(--border-primary)/70 bg-(--bg-primary)/70 backdrop-blur-md">
      <nav className="mx-auto flex h-20 w-[80%] items-center justify-between gap-4 px-4">
        <div className="hidden w-full items-center md:grid md:grid-cols-3">
          <Link href="/" className="text-lg font-bold text-(--text-primary)">
            VITRINA
          </Link>

          <div className="justify-self-center">
            <NavLinks />
          </div>

          <div className="justify-self-end">
            <CartButton />
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <CartButton />
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
}
