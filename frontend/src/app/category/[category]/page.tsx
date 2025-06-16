"use client";
import useAuth from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import logoutUser from "@/services/user/logoutUser";
import NavBar from "@/components/NavBar";
import HeaderBar from "@/components/HeaderBar";
import { useEffect, useState } from "react";
import getItems from "@/services/item/getItems";
import Link from "next/link";
import Image from "next/image";
import { Item } from "@/types/item";
import { toTitleCase } from "@/utils/titleCase";
import { Option } from "@/types/option";
import FilterBar from "@/components/FilterBar";
import { ItemFilter } from "@/types/itemFilter";

export default function Home() {
  const { isAuthenticated, refreshAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState<Array<Item>>([]);
  const [titleFilter, setTitleFilter] = useState<string>("");
  const [conditionFilter, setConditionFilter] = useState<Option | null>(null);
  const [typeFilter, setTypeFilter] = useState<Option | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const filters: ItemFilter = {};
        if (titleFilter) {
          filters.title = titleFilter;
        }
        if (conditionFilter) {
          filters.condition = conditionFilter.value;
        }
        if (typeFilter) {
          filters.type = typeFilter.value;
        }
        const category_filter = pathname.replace("/category/", "");
        filters.category = category_filter;
        const response = await getItems({ category: category_filter });
        setItems(response);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [pathname, titleFilter, conditionFilter, typeFilter]);

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
          handleTitleFilter={setTitleFilter}
        />
      </div>

      <div className="fixed top-16 left-0 w-60 h-[calc(100vh-4rem)] bg-slate-900 text-white px-6 py-6 shadow-slate-400 shadow-xl flex flex-col justify-between">
        <NavBar
          handleLogout={handleLogout}
          pathname={pathname}
          isAuthenticated={isAuthenticated}
        />
      </div>

      <div className="ml-60 p-6">
        <FilterBar
          conditionFilter={conditionFilter}
          typeFilter={typeFilter}
          handleConditionFilter={setConditionFilter}
          handleTypeFilter={setTypeFilter}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {items.length > 0 ? (
            items.map((item) => (
              <Link key={item.id} href={`/view_product/${item.id}`}>
                <div className="bg-white rounded shadow p-4 cursor-pointer hover:shadow-lg transition-all h-full">
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover mb-3 rounded"
                  />
                  <h4 className="text-slate-800 font-bold">
                    {toTitleCase(item.title)}
                  </h4>
                  <p className="text-blue-600">{toTitleCase(item.condition)}</p>
                  <p className="text-slate-600 text-sm">
                    {toTitleCase(item.type)}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-4 text-center text-slate-600">
              <p>No items available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
