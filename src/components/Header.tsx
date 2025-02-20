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
            <Link href="/" className="rounded-md p-2 hover:underline bg-blue-200">
              Trang Chủ
            </Link>
          </li>
          <li>
            <Link href="/bill" className="p-2 rounded-md hover:underline bg-blue-200">
              Hóa đơn
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
