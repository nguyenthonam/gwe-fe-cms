import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white text-blue-600 p-4 border-b-2 border-gray-600">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={200} height={100} className="rounded-full" />
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:underline">
              About
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
