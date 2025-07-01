"use client";
/**
 * CategoryPage component displays a list of items filtered by category and other criteria.
 * It includes authentication handling, filtering options, and navigation.
 */
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

export default function CategoryPage() {
  const { isAuthenticated, refreshAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState<Array<Item>>([]);
  const [titleFilter, setTitleFilter] = useState<string>("");
  const [conditionFilter, setConditionFilter] = useState<Option | null>(null);
  const [typeFilter, setTypeFilter] = useState<Option | null>(null);

  // Fetch and filter items based on category and applied filters (title, condition, type)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const filters: ItemFilter = {};
        if (titleFilter) filters.title = titleFilter;
        if (conditionFilter) filters.condition = conditionFilter.value;
        if (typeFilter) filters.type = typeFilter.value;
        const category_filter = pathname.replace("/category/", "");
        filters.category = category_filter;
        const response = await getItems({ category: category_filter });
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
  }, [pathname, titleFilter, conditionFilter, typeFilter]);

  // Handlers for redirecting user to login and logging out
  const handleLogin = async () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await logoutUser();
    refreshAuth();
    router.refresh();
  };

  return (
    <main className="bg-background w-screen min-h-screen pt-16" role="main">
      <div
        className="fixed top-0 left-0 w-full bg-contrast shadow z-50 px-6 py-4 flex items-center justify-between gap-4 sm:gap-10"
        aria-label="Site Header"
      >
        <HeaderBar
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
          handleTitleFilter={setTitleFilter}
        />
      </div>

      <div
        className="z-40 fixed top-16 left-0 sm:w-60 w-full sm:h-[calc(100vh-4rem)] bg-contrast text-surface px-2 py-6 shadow-grey-shadow shadow-xl flex flex-col items-center sm:items-start sm:justify-between"
        aria-label="Navigation Menu"
      >
        <NavBar
          handleLogout={handleLogout}
          pathname={pathname}
          isAuthenticated={isAuthenticated}
        />
      </div>

      <div
        className={`sm:ml-60 sm:mt-0 sm:pt-0 p-6 ${isAuthenticated ? "mt-96 pt-20" : "mt-64"}`}
      >
        {/* UI component for applying filter options to the item list */}
        <FilterBar
          conditionFilter={conditionFilter}
          typeFilter={typeFilter}
          handleConditionFilter={setConditionFilter}
          handleTypeFilter={setTypeFilter}
        />
        {/* Display a grid of items that match the selected filters */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
          {items.length > 0 ? (
            items.map((item) => (
              <Link
                key={item.id}
                href={`/view_product/${item.id}`}
                prefetch={true}
                aria-label={`View details for ${item.title}`}
              >
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
            // Message shown when no items are found for the current filter
            <div className="col-span-4 text-center text-muted">
              <p>No items available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
