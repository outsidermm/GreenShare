"use client";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import logoutUser from "@/services/logoutUser";
import HeaderBar from "@/components/HeaderBar";

export default function Home() {
  const { isAuthenticated, refreshAuth } = useAuth();
  const router = useRouter();

  const categories = [
    { label: "Essentials", path: "/category/essentials" },
    { label: "Living", path: "/category/living" },
    { label: "Tools & Tech", path: "/category/tools-tech" },
    { label: "Style & Expression", path: "/category/style-expression" },
    { label: "Leisure & Learning", path: "/category/leisure-learning" },
  ];

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
          pathname="/"
          isAuthenticated={isAuthenticated}
        />
      </div>

      <div className="ml-60 p-6">
        <div className="bg-blue-400 text-white rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold">Free Delivery!</h2>
          <p className="text-sm">
            Today only - next-day delivery on all orders.
          </p>
          <button className="mt-4 bg-white text-blue-500 px-4 py-2 rounded">
            Browse products
          </button>
        </div>

        <h3 className="text-xl text-slate-800 font-semibold mb-4">
          Hot Deals 🔥
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {[
            { name: "Nintendo Switch", condition: "Brand new" },
            { name: "Sony A7s III", condition: "Slightly used" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded shadow p-4">
              <div className="bg-slate-500 h-32 mb-3 rounded" />
              <h4 className="text-slate-800 font-bold">{item.name}</h4>
              <p className="text-blue-600">{item.condition}</p>
              <button className="mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-green-600">
                Make a Offer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
