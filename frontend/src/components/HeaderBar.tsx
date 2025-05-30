"use client";

import { FaRegHeart } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdOutlineShoppingCart } from "react-icons/md";

interface HeaderBarProps {
  isAuthenticated: boolean;
  handleLogin: () => void;
}

export default function HeaderBar(HeaderBarProps: HeaderBarProps) {
  const { isAuthenticated, handleLogin } = HeaderBarProps;
  return (
    <>
      <div className="text-lg font-bold text-green-600">GreenShare</div>

      <div className="flex items-center gap-4 flex-grow px-4">
        <input
          type="text"
          placeholder="Search for items"
          className="flex-grow px-3 py-2 rounded-xl border border-white focus:border-green-500 outline-none placeholder-white bg-inherit text-sm"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        <button>
          <FaRegHeart />
        </button>
        <button>
          <MdOutlineShoppingCart />
        </button>
        <button>
          <IoMdNotificationsOutline />
        </button>
        {isAuthenticated ? (
          <button className="text-sm">Profile</button>
        ) : (
          <button
            onClick={handleLogin}
            className="text-sm text-green-700 border px-3 py-1 rounded hover:bg-green-50"
          >
            Login
          </button>
        )}
      </div>
    </>
  );
}
