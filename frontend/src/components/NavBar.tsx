"use client";

import { MdLogout } from "react-icons/md";
import Link from "next/link";

interface NavBarProps {
  handleLogout: () => void;
  pathname: string;
  isAuthenticated: boolean;
}

// NavBar component displays category links and user-specific navigation options with logout functionality
export default function NavBar(props: NavBarProps) {
  const { handleLogout, pathname, isAuthenticated } = props;

  // Array of categories to be rendered in the navigation list
  const categories = [
    { label: "Essentials", path: "/category/essentials" },
    { label: "Living", path: "/category/living" },
    { label: "Tools & Tech", path: "/category/tools-tech" },
    { label: "Style & Expression", path: "/category/style-expression" },
    { label: "Leisure & Learning", path: "/category/leisure-learning" },
  ];

  return (
    <>
      <nav aria-label="Primary site navigation">
        <h2 className="font-bold mb-2">
          <Link
            href="/"
            className={`block ml-0 sm:ml-2 px-2 py-1 rounded transition-all ${
              pathname === "/"
                ? "bg-mono-contrast-light border-l-0 sm:border-l-4 border-main-primary text-main-secondary font-semibold hover:text-main-primary"
                : "text-mono-primary hover:text-main-secondary"
            }`}
          >
            Categories
          </Link>
        </h2>
        <ul className="space-y-1" role="list">
          {categories.map(({ label, path }) => {
            const isActive = pathname === path;
            return (
              <li key={path}>
                <Link
                  href={path}
                  className={`block ml-0 sm:ml-2 px-2 py-1 rounded transition-all ${
                    isActive
                      ? "bg-mono-contrast-light border-l-0 sm:border-l-4 border-main-primary text-main-secondary font-semibold hover:text-main-primary"
                      : "text-mono-primary hover:text-main-secondary"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        {isAuthenticated && (
          <hr className="my-2 border-t border-mono-secondary mx-4" />
        )}
        {isAuthenticated && (
          <h2 className="font-bold my-4">
            <Link
              href="/manage_products"
              className={`block ml-0 sm:ml-2 px-2 py-1 rounded transition-all ${
                pathname === "/manage_products"
                  ? "bg-mono-contrast-light border-l-0 sm:border-l-4 border-main-primary text-main-secondary font-semibold hover:text-main-primary"
                  : "text-mono-primary hover:text-main-secondary"
              }`}
            >
              Manage your Products
            </Link>
          </h2>
        )}
        {isAuthenticated && (
          <hr className="my-2 border-t border-mono-secondary mx-4" />
        )}
        {isAuthenticated && (
          <h2 className="font-bold my-4">
            <Link
              href="/manage_offers"
              className={`block ml-0 sm:ml-2 px-2 py-1 rounded transition-all ${
                pathname === "/manage_offers"
                  ? "bg-mono-contrast-light border-l-0 sm:border-l-4 border-main-primary text-main-secondary font-semibold hover:text-main-primary"
                  : "text-mono-primary hover:text-main-secondary"
              }`}
            >
              Manage your Offers
            </Link>
          </h2>
        )}
      </nav>
      {/* Render logout button and icon for authenticated users */}
      {isAuthenticated && (
        <div className="flex flex-row items-center transition-all cursor-pointer text-mono-primary hover:text-main-secondary py-4 ml-3">
          <MdLogout onClick={handleLogout} className="mr-2" />
          <button
            className="font-bold text-mono-primary hover:text-main-secondary"
            onClick={handleLogout}
            aria-label="Log out of GreenShare"
          >
            Log Out
          </button>
        </div>
      )}
    </>
  );
}
