"use client";
import useAuth from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import logoutUser from "@/services/logoutUser";
import NavBar from "@/components/NavBar";
import HeaderBar from "@/components/HeaderBar";
import { useEffect, useState } from "react";
import getItem from "@/services/getItem";
import Image from "next/image";
import { FaChevronLeft } from "react-icons/fa6";

interface Item {
    id: string;
    user_id: string;
    title: string;
    description: string;
    condition: string;
    status: string;
    location: string;
    category: string;
    type: string;
    updated_at: string;
    images: string[];
}

export default function Home() {
  const { isAuthenticated, refreshAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [item, setItem] = useState<Item>();
  const item_id_filter = pathname.replace("/view_product/", "");

  const categories = [
    { label: "Essentials", path: "/category/essentials" },
    { label: "Living", path: "/category/living" },
    { label: "Tools & Tech", path: "/category/tools-tech" },
    { label: "Style & Expression", path: "/category/style-expression" },
    { label: "Leisure & Learning", path: "/category/leisure-learning" },
  ];

  useEffect (() => {
    const fetchItems = async () => {
      try {
        const response = await getItem({item_id: item_id_filter});
        if (response.length === 1) {
        setItem(response[0]);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
},[pathname, item_id_filter])

  const handleLogin = async () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await logoutUser();
    refreshAuth();
    router.refresh();
  };

  return (
    <div className="bg-slate-100 w-screen min-h-screen pt-16">
      <div className="fixed top-0 left-0 w-full bg-slate-900 shadow z-50 px-6 py-4 flex items-center justify-between gap-4 sm:gap-10">
        <HeaderBar
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
        />
      </div>

      <div className="fixed top-16 left-0 w-60 h-[calc(100vh-4rem)] bg-slate-900 text-white px-6 py-6 shadow-slate-400 shadow-xl flex flex-col justify-between">
        <NavBar
          categories={categories}
          handleLogout={handleLogout}
          pathname={pathname}
          isAuthenticated={isAuthenticated}
        />
      </div>

      <div className="ml-60 p-6">
        <div className= "p-2">
          <div onClick={() => router.back()} className="cursor-pointer w-fit p-1 hover:bg-slate-300 rounded">
            <FaChevronLeft color="black" size={16} />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            {item && (
              <Image
                src={item.images[0] || "/placeholder.png"}
                alt={item.title}
                width={500}
                height={500}
                className="w-full max-h-screen rounded shadow"
              />
            )}
          </div>
          <div className="flex-1">
            {item ? (
              <>
                <h1 className="text-2xl font-bold text-slate-800 mb-4">{item.title}</h1>
                <h3 className="text-lg font-medium text-slate-700 mb-2">Description:</h3>
                <p className="text-slate-600 mb-4">{item.description}</p>

                <h3 className="text-lg font-medium text-slate-700 mb-2">Condition:</h3>
                <p className="text-blue-600 mb-2">{item.condition}</p>

                <h3 className="text-lg font-medium text-slate-700 mb-2">Type:</h3>
                <p className="text-slate-600 mb-2">{item.type}</p>

                <h3 className="text-lg font-medium text-slate-700 mb-2">Location:</h3>
                <p className="text-slate-600 mb-2">{item.location}</p>

                <h3 className="text-lg font-medium text-slate-700 mb-2">Last Updated:</h3>
                <p className="text-slate-600 mb-2">{new Date(item.updated_at).toLocaleDateString()}</p>

              </>
            ) : (
              <div className="text-center text-slate-600">
                <p>Item not found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
