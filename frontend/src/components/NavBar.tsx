"use client";

import { MdLogout } from "react-icons/md";
import Link from "next/link";

interface NavBarProps {
  categories: {
    label: string;
    path: string;
  }[];
  handleLogout: () => void;
  pathname: string;
  isAuthenticated: boolean;
}

export default function NavBar(props: NavBarProps) {
  const { categories, handleLogout, pathname, isAuthenticated } = props;

  return (
    <>
      <div>
        <h2 className="text-sm font-bold mb-2">
          <Link
            href="/"
            className={`block px-4 py-1 rounded transition-all ${
              pathname === "/"
                ? "bg-slate-800 border-l-4 border-green-400 text-green-400 font-semibold"
                : "hover:text-green-400"
            }`}
          >
            {" "}
            Categories{" "}
          </Link>
        </h2>
        <ul className="space-y-1 text-sm">
          {categories.map(({ label, path }) => {
            const isActive = pathname === path;
            return (
              <li key={path}>
                <Link
                  href={path}
                  className={`block px-4 py-1 rounded transition-all ${
                    isActive
                      ? "bg-slate-800 border-l-4 border-green-400 text-green-400 font-semibold"
                      : "hover:text-green-400"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <h2 className="text-sm font-bold mb-2 mt-4">Offers</h2>
      </div>
      {isAuthenticated && (
        <div className="flex flex-row transition-all cursor-pointer py-4">
          <MdLogout onClick={handleLogout} className="mr-2" />
          <button
            className="text-sm font-bold text-white"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      )}
    </>
  );
}
