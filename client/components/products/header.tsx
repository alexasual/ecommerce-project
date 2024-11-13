// components/Header.tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="container mx-auto flex justify-between">
        <Link href="/">
          <a className="text-xl font-bold">Marketplace</a>
        </Link>
        <Link href="/cart">
          <a className="text-xl">Cart</a>
        </Link>
      </nav>
    </header>
  );
}