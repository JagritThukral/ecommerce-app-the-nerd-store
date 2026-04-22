"use client";

import { Geist_Mono, Sekuya } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/src/lib/auth-client";

const sekuya = Sekuya({
  weight: "400",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-Mono",
  subsets: ["latin"],
});

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  const navLinks = [
    {
      label: "Home",
      href: "/#home",
    },
    {
      label: "Men",
      href: "/#men",
    },
    {
      label: "Women",
      href: "/#women",
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch {
      router.push("/");
    }
  };
  function handleUserIconClick() {
    if (!session?.user) router.push("/login");
  }
  return (
    <nav
      className={
        "fixed top-0 flex flex-row w-full h-16 bg-transparent text-primary items-center z-30 " +
        sekuya.className
      }
    >
      {/* LEFT */}
      <div
        className={
          "w-1/3 flex justify-start items-center ml-12 text-black " +
          geistMono.className
        }
      >
        <ul className="flex flex-row gap-6 justify-center items-center text-2xl font-medium">
          {navLinks.map((nLink) => (
            <Link key={nLink.label} href={nLink.href} prefetch={false}>
              {nLink.label}
            </Link>
          ))}
        </ul>
      </div>

      {/* CENTER */}
      <div className="w-1/3 h-full flex items-center justify-center overflow-hidden">
        <svg
          fill="#ffffff"
          className="w-full  "
          version="1.1"
          viewBox="144 144 512 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0" />
          <g id="SVGRepo_tracerCarrier" />

          <g id="SVGRepo_iconCarrier">
            <path
              d="m525.95 531.2c6.6133 0 12.531-4.1367 14.801-10.371l83.969-230.91c1.7422-4.8281 1.0508-10.203-1.9102-14.402-2.9375-4.2188-7.7461-6.7188-12.891-6.7188h-419.84c-5.1445 0-9.9492 2.5-12.891 6.7188-2.9609 4.1992-3.6523 9.5742-1.9102 14.402l83.969 230.91c2.2656 6.2344 8.1875 10.371 14.801 10.371h251.91z"
              fill="#ffffff"
              fillRule="evenodd"
              stroke="#ffffff"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <text
            x="400"
            y="410"
            fill="#000"
            textAnchor="middle"
            fontSize="20"
            className="text-black"
          >
            The Nerd Store
          </text>
        </svg>
      </div>

      {/* RIGHT */}
      <div
        className={
          "w-1/3 flex justify-end items-center mr-12 text-black relative group " +
          geistMono.className
        }
      >
        <button
          aria-label="User menu"
          className="w-11 h-11 rounded-full border border-black/20 bg-white flex items-center justify-center"
          onClick={handleUserIconClick}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
            <circle
              cx="12"
              cy="8"
              r="4"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M4 20c1.8-3.2 4.4-4.8 8-4.8s6.2 1.6 8 4.8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {session?.user ? (
          <>
            <div className="absolute right-0 top-11 hidden group-hover:block h-5 w-36 z-40" />
            <div className="absolute right-4 top-[2.95rem] hidden group-hover:block w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white z-50" />
            <div className="absolute right-0 top-14 hidden group-hover:flex flex-col min-w-52 rounded-xl border border-black/10 bg-white shadow-lg p-2 z-50">
              <div className="px-3 py-2 border-b border-black/10 mb-1">
                <p className="text-sm font-semibold">
                  {session.user.name || "User"}
                </p>
                <p className="text-xs text-black/60">
                  {session.user.email || ""}
                </p>
              </div>
              <Link
                href="/wishlist"
                className="text-left px-3 py-2 rounded-lg hover:bg-black/5"
              >
                Wishlist
              </Link>
              <Link
                href="/orders"
                className="text-left px-3 py-2 rounded-lg hover:bg-black/5"
              >
                Orders
              </Link>
              <button
                onClick={handleLogout}
                className="text-left px-3 py-2 rounded-lg hover:bg-black/5"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </nav>
  );
}
