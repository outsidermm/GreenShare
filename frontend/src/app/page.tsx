"use client";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import logoutUser from "@/services/user/logoutUser";
import HeaderBar from "@/components/HeaderBar";
import { useEffect, useState } from "react";
import getItems from "@/services/item/getItems";
import Link from "next/link";
import { Item } from "@/types/item";
import FilterBar from "@/components/FilterBar";
import { Option } from "@/types/option";
import { ItemFilter } from "@/types/itemFilter";
import ItemCard from "@/components/ItemCard";
import { motion } from "framer-motion";

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
    // Initial fetch
    fetchItems();

    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchItems, 3000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [titleFilter, conditionFilter, typeFilter]);

  useEffect(() => {
    router.prefetch("/category/essentials");
    router.prefetch("/category/living");
    router.prefetch("/category/tools-tech");
    router.prefetch("/category/style-expression");
    router.prefetch("/category/leisure-learning");
  }, [router]);

  const handleLogin = async () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await logoutUser();
    refreshAuth();
    router.refresh();
  };

  return (
    <div className="bg-mono-light w-screen min-h-screen pt-16">
      <div className="fixed top-0 left-0 w-full bg-mono-contrast shadow z-50 px-6 py-4 flex items-center justify-between gap-4 sm:gap-10">
        <HeaderBar
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
          handleTitleFilter={setTitleFilter}
        />
      </div>

      <div className="z-40 fixed top-16 left-0 sm:w-60 w-full sm:h-[calc(100vh-4rem)] bg-mono-contrast text-surface px-2 py-6 shadow-grey-shadow shadow-xl flex flex-col items-center sm:items-start sm:justify-between">
        <NavBar
          handleLogout={handleLogout}
          pathname="/"
          isAuthenticated={isAuthenticated}
        />
      </div>

      <div
        className={`sm:ml-60 sm:mt-2 p-6 ${isAuthenticated ? "mt-96" : "mt-64"}`}
      >
        <div
          className={`bg-main-light text-mono-primary rounded-xl shadow-lg p-6 mb-8 sm:mt-0 ${isAuthenticated ? "mt-16" : "mt-0"}`}
        >
          <h2 className="text-2xl font-bold">Welcome to GreenShare 🌱</h2>
          <p>
            Where communities thrive by giving goods a second life. Join us in
            reducing waste, sharing with purpose, and building a more
            sustainable tomorrow.
          </p>
          {isAuthenticated ? (
            <Link href="/manage_products" prefetch={true}>
              <button className="mt-4 bg-mono-contrast-light hover:bg-main-secondary border-main-primary border-2 text-mono-primary active:bg-main-primary font-semibold px-4 py-2 rounded-full transition-all">
                Add a New Item
              </button>
            </Link>
          ) : (
            <Link href="/login" prefetch={true}>
              <button className="mt-4 bg-mono-contrast-light hover:bg-main-secondary border-main-primary border-2 text-mono-primary active:bg-main-primary font-semibold px-4 py-2 rounded-full transition-all">
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

        <h3 className="text-xl text-mono-primary font-semibold mb-4">
          Hot Deals 🔥
        </h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
          {items.length > 0 ? (
            items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{amount: 0.3 }}
              >
                <ItemCard item={item} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-4 text-center text-mono-secondary">
              <p>No items available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
