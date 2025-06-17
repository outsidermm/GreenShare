"use client";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import logoutUser from "@/services/user/logoutUser";
import HeaderBar from "@/components/HeaderBar";
import { useEffect, useState } from "react";
import getItems from "@/services/item/getItems";
import Link from "next/link";
import Image from "next/image";
import { Item } from "@/types/item";
import { toTitleCase } from "@/utils/titleCase";
import FilterBar from "@/components/FilterBar";
import { Option } from "@/types/option";
import { ItemFilter } from "@/types/itemFilter";

export default function Home() {
  const { isAuthenticated, refreshAuth } = useAuth();
  const router = useRouter();
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
        const response = await getItems(filters);
        setItems(response);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [titleFilter, conditionFilter, typeFilter]);

  const handleLogin = async () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await logoutUser();
    refreshAuth();
    router.refresh();
  };

  return (
    <div className="bg-background w-screen min-h-screen pt-16">
      <div className="fixed top-0 left-0 w-full bg-contrast shadow z-50 px-6 py-4 flex items-center justify-between gap-4 sm:gap-10">
        <HeaderBar
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
          handleTitleFilter={setTitleFilter}
        />
      </div>

      <div className="z-50 fixed top-16 left-0 sm:w-60 w-full sm:h-[calc(100vh-4rem)] bg-contrast text-surface px-6 py-6 shadow-grey-shadow shadow-xl flex flex-col items-center sm:items-start sm:justify-between">
        <NavBar
          handleLogout={handleLogout}
          pathname="/"
          isAuthenticated={isAuthenticated}
        />
      </div>

      <div className={`sm:ml-60 sm:mt-0 p-6 ${isAuthenticated ? "mt-96 pt-20" : "mt-64"}`}>
        <div className="bg-action-primary text-white rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold">Welcome to GreenShare 🌱</h2>
          <p>
            Where communities thrive by giving goods a second life. Join us in
            reducing waste, sharing with purpose, and building a more
            sustainable tomorrow.
          </p>
          {isAuthenticated ? (
            <Link href="/manage_products">
              <button className="mt-4 bg-surface hover:bg-unselected-highlight text-action-primary font-semibold px-4 py-2 rounded transition-all">
                Add a New Item
              </button>
            </Link>
          ) : (
            <Link href="/login">
              <button className="mt-4 bg-surface hover:bg-unselected-highlight text-action-primary font-semibold px-4 py-2 rounded transition-all">
                Login to Add a New Item
              </button>
            </Link>
          )}
        </div>

        <FilterBar
          conditionFilter={conditionFilter}
          typeFilter={typeFilter}
          handleConditionFilter={setConditionFilter}
          handleTypeFilter={setTypeFilter}
        />

        <h3 className="text-xl text-content font-semibold mb-4">
          Hot Deals 🔥
        </h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
          {items.length > 0 ? (
            items.map((item) => (
              <Link key={item.id} href={`/view_product/${item.id}`}>
                <div className="bg-surface rounded shadow p-4 cursor-pointer hover:shadow-lg transition-all h-full">
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover mb-3 rounded"
                  />
                  <h4 className="text-content font-bold">
                    {toTitleCase(item.title)}
                  </h4>
                  <p className="text-hyperlink">
                    {toTitleCase(item.condition)}
                  </p>
                  <p className="text-muted">{toTitleCase(item.type)}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-4 text-center text-muted">
              <p>No items available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
