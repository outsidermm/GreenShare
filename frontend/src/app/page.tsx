'use client';
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import useAuth from "../hooks/useAuth";
import { useRouter } from 'next/navigation';


export default function Home() {
  const { isAuthenticated, refreshAuth } = useAuth();
  const router = useRouter();

  const handleLogin = async() => {
    router.push('/login')
  };
  
  return (
    <div className="bg-slate-100 w-screen h-screen pt-16">
      <div className="fixed top-0 left-0 w-full bg-slate-800 shadow z-50 px-6 py-4 flex items-center justify-between gap-4 sm:gap-10">
        <div className="text-lg font-bold text-green-600">GreenShare</div>

        <div className="flex items-center gap-4 flex-grow px-4">
          <input
            type="text"
            placeholder="Search for items"
            className="flex-grow px-3 py-2 rounded-xl border border-white focus:border-green-500 outline-none placeholder-white bg-inherit"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <button><FaRegHeart /></button>
          <button><MdOutlineShoppingCart /></button>
          <button><IoMdNotificationsOutline /></button>
          {isAuthenticated ? (
            <button>
              Profile
            </button>
          ) : (
            <button onClick={handleLogin} className="text-sm text-green-700 border px-3 py-1 rounded hover:bg-green-50">
              Login
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <p className="mt-2 text-slate-800">TEST</p>
      </div>
    </div>
  );
}
