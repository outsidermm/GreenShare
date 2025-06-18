"use client";

import { MdLogout } from "react-icons/md";
import Link from "next/link";

interface NavBarProps {
  handleLogout: () => void;
  pathname: string;
  isAuthenticated: boolean;
}

export default function NavBar(props: NavBarProps) {
  const { handleLogout, pathname, isAuthenticated } = props;

  const categories = [
    { label: "Essentials", path: "/category/essentials" },
    { label: "Living", path: "/category/living" },
    { label: "Tools & Tech", path: "/category/tools-tech" },
    { label: "Style & Expression", path: "/category/style-expression" },
    { label: "Leisure & Learning", path: "/category/leisure-learning" },
  ];

  return (
    <>
      <div>
        <h2 className="font-bold mb-2">
          <Link
            href="/"
            className={`block px-4 py-1 rounded transition-all ${
              pathname === "/"
                ? "bg-content border-l-4 border-action-secondary text-action-secondary font-semibold"
                : "hover:text-action-secondary"
            }`}
          >
            Categories
          </Link>
        </h2>
        <ul className="space-y-1">
          {categories.map(({ label, path }) => {
            const isActive = pathname === path;
            return (
              <li key={path}>
                <Link
                  href={path}
                  className={`block px-4 py-1 rounded transition-all ${
                    isActive
                      ? "bg-content border-l-4 border-action-secondary text-action-secondary font-semibold"
                      : "hover:text-action-secondary"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        {isAuthenticated && (
          <h2 className="font-bold mb-2 mt-6">
            <Link
              href="/manage_products"
              className={`block px-4 py-1 rounded transition-all ${
                pathname === "/manage_products"
                  ? "bg-content border-l-4 border-action-secondary text-action-secondary font-semibold"
                  : "hover:text-action-secondary"
              }`}
            >
              Manage your Products
            </Link>
          </h2>
        )}
        {isAuthenticated && (
          <h2 className="font-bold mb-2 mt-6">
            <Link
              href="/manage_offers"
              className={`block px-4 py-1 rounded transition-all ${
                pathname === "/manage_offers"
                  ? "bg-content border-l-4 border-action-secondary text-action-secondary font-semibold"
                  : "hover:text-action-secondary"
              }`}
            >
              Manage your Offers
            </Link>
          </h2>
        )}
      </div>
      {isAuthenticated && (
        <div className="flex flex-row transition-all cursor-pointer py-4">
          <MdLogout onClick={handleLogout} className="mr-2" />
          <button className="font-bold text-surface" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      )}
    </>
  );
}
