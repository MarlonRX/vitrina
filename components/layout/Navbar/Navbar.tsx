import CartButton from "@/components/cart/CartButton";
import Logo from "@/components/layout/Logo";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";
import { SearchPaletteButton, SearchPaletteHost } from "./SearchPalette";

// S-01.5 (navbar unificada): el campo de búsqueda inline desaparece en todos
// los breakpoints. Desktop: logo a la izquierda, enlaces al centro, y a la
// derecha solo el icono de búsqueda junto a la canasta. La canasta abre el
// drawer-preview. La paleta de búsqueda es un singleton montado aquí.
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-(--border-primary)/70 bg-(--bg-primary)/70 backdrop-blur-md">
      <nav className="mx-auto flex h-20 w-[80%] items-center justify-between gap-4 px-4">
        <div className="hidden w-full items-center gap-4 md:flex">
          <Logo className="shrink-0" />

          <div className="flex flex-1 justify-center">
            <NavLinks />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <SearchPaletteButton />
            <CartButton />
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-2 md:hidden">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <SearchPaletteButton />
            <CartButton />
            <MobileMenu />
          </div>
        </div>
      </nav>
      <SearchPaletteHost />
    </header>
  );
}
