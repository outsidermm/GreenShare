"use client";
import { useRouter, usePathname } from "next/navigation";
import logoutUser from "@/services/user/logoutUser";
import NavBar from "@/components/NavBar";
import HeaderBar from "@/components/HeaderBar";
import useAuth from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { toTitleCase } from "@/utils/titleCase";
import swal from "sweetalert";
import { extractErrorMessage } from "@/utils/extractErrorMsg";
import getUserItems from "@/services/item/getUserItems";
import deleteItem from "@/services/item/deleteItem";
import { Item } from "@/types/item";
import ProductForm from "@/components/ProductForm";

export default function AddOfferPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, refreshAuth } = useAuth();
  const [ownedItems, setOwnedItems] = useState<Item[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item>();

  useEffect(() => {
    (async () => {
      try {
        const requested_user_items_response = await getUserItems();
        setOwnedItems(requested_user_items_response);
      } catch (error) {
        console.error("Error fetching requested item:", error);
        if (error instanceof Error) {
          if (!isAuthenticated) {
            swal("Please log in to manage your items.", {
              icon: "warning",
              buttons: ["Cancel", "Login"],
            }).then((willLogin) => {
              if (willLogin === "Login") {
                router.push("/login");
              }
            });
            return;
          }
          swal("Error", extractErrorMessage(error.message), "error");
        }
      }
    })();
  }, [pathname,isAuthenticated, router]);

  const handleLogin = async () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await logoutUser();
    refreshAuth();
    router.refresh();
  };

  const handleDeleteItem = async (item_id: number) => {
    try {
      await deleteItem(item_id);
      swal("Success!", "Product deleted successfully!", "success");

      // Refresh the items list after deletion
      const updatedItems = ownedItems.filter((item) => item.id !== item_id);
      setOwnedItems(updatedItems);
      router.refresh();
    } catch (error) {
      console.error("Error deleting item:", error);
      if (error instanceof Error) {
        swal("Error", extractErrorMessage(error.message), "error");
      }
    }
  };

  return (
    <div className="bg-slate-100 w-screen h-screen pt-16">
      <div className="fixed top-0 left-0 w-full bg-slate-900 shadow z-50 px-6 py-4 flex items-center justify-between gap-4 sm:gap-10">
        <HeaderBar
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
        />
      </div>

      <div className="fixed top-16 left-0 w-60 h-[calc(100vh-4rem)] bg-slate-900 text-white px-6 py-6 shadow-slate-400 shadow-xl flex flex-col justify-between">
        <NavBar
          handleLogout={handleLogout}
          pathname={pathname}
          isAuthenticated={isAuthenticated}
        />
      </div>

      <div className="ml-60 p-6 relative h-[calc(100vh-4rem)] overflow-hidden">
        <h1 className="text-2xl font-bold mb-4 text-slate-800 px-4">
          View Your Items
        </h1>

        <div className="p-4">
          {ownedItems.length > 0 ? (
            ownedItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 mb-4 rounded-lg shadow flex justify-between gap-8 flex-col sm:flex-row"
              >
                <div className="flex-2">
                  <p className="text-slate-800">
                    <strong>Title:</strong> {toTitleCase(item.title)}
                  </p>
                  <p className="text-slate-800">
                    <strong>Description</strong> {toTitleCase(item.description)}
                  </p>
                  <p className="text-slate-800">
                    <strong>Condition:</strong> {toTitleCase(item.condition)}
                  </p>
                  <p className="text-slate-800">
                    <strong>Status:</strong> {toTitleCase(item.status)}
                  </p>
                  <p className="text-slate-800">
                    <strong>Location:</strong> {toTitleCase(item.location)}
                  </p>
                  <p className="text-slate-800">
                    <strong>Category:</strong> {toTitleCase(item.category)}
                  </p>
                  <p className="text-slate-800">
                    <strong>Type:</strong> {toTitleCase(item.type)}
                  </p>
                  <p className="text-slate-800">
                    <strong>Last Updated:</strong>{" "}
                    {new Date(item.updated_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setIsEditOpen(true);
                    }}
                    className={
                      "w-full rounded bg-green-600 hover:bg-green-500 text-slate-900 border-green-600 font-bold py-2 px-4 border-solid border-2 transition-all mt-4"
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="w-full rounded bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-2 border-solid border-2 border-red-600 transition-all mt-4"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-800">You do not own any items.</p>
          )}
        </div>
        {isEditOpen && (
          <div className="fixed top-16 left-60 w-full h-full z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-40 transition-all">
            <div className="bg-white p-12 rounded-xl shadow-xl w-full max-w-3xl relative">
              <button
                onClick={() => setIsEditOpen(false)}
                className="absolute top-4 right-4 text-slate-700 hover:text-slate-800 text-4xl font-bold"
              >
                &times;
              </button>
              <ProductForm
                {...(selectedItem ? { item: selectedItem } : {})}
              />
            </div>
          </div>
        )}
        <div className = "fixed bottom-4 right-4 z-50">
          <button
            onClick={() => {
              setSelectedItem(undefined);
              setIsEditOpen(true);
            }}
            className="bg-green-600 text-slate-800 px-4 py-2 rounded-full hover:bg-green-500 flex items-center gap-2 transition-all border-2 border-green-600 font-bold shadow-xl"
          >
            Add New Item
          </button>
        </div>
      </div>
    </div>
  );
}
