"use client";
// This page allows authenticated users to manage (view, edit, delete) their posted items.
import { useRouter, usePathname } from "next/navigation";
import logoutUser from "@/services/user/logoutUser";
import NavBar from "@/components/NavBar";
import HeaderBar from "@/components/HeaderBar";
import useAuth from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import swal from "sweetalert";
import { extractErrorMessage } from "@/utils/extractErrorMsg";
import getUserItems from "@/services/item/getUserItems";
import deleteItem from "@/services/item/deleteItem";
import { Item } from "@/types/item";
import ProductForm from "@/components/ProductForm";
import ProductDetailCard from "@/components/ProductDetailCard";
import { ImCross } from "react-icons/im";

export default function ManageProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, refreshAuth } = useAuth();
  const [ownedItems, setOwnedItems] = useState<Item[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item>();

  // Fetches the authenticated user's items on page load. If unauthenticated, prompts for login or redirects.
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
              if (willLogin) {
                router.push("/login");
              } else {
                router.push("/");
              }
            });
            return;
          }
          swal("Error", extractErrorMessage(error.message), "error");
        }
      }
    })();
  }, [pathname, isAuthenticated, router]);

  // Disables background scrolling when the edit modal is open.
  useEffect(() => {
    if (isEditOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isEditOpen]);

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
    <main
      role="main"
      aria-label="Manage Products Page"
      className="bg-background min-h-[calc(100vh-4rem)]"
    >
      <div className="fixed top-0 left-0 w-full bg-mono-contrast shadow z-50 px-6 py-4 flex items-center justify-between gap-4 sm:gap-10">
        <HeaderBar
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
        />
      </div>
      <div>
        <div className="z-40 fixed top-16 left-0 sm:w-60 w-full sm:h-[calc(100vh-4rem)] bg-mono-contrast text-surface px-2 py-6 shadow-grey-shadow shadow-xl flex flex-col items-center sm:items-start sm:justify-between">
          <NavBar
            handleLogout={handleLogout}
            pathname={pathname}
            isAuthenticated={isAuthenticated}
          />
          </div>
          <div className={`sm:ml-60 p-6 sm:mt-16 pb-24`}>
            <header className="mt-28 sm:mt-0">
              <h1 className="text-2xl font-bold mb-4 text-content px-4">
                View Your Items
              </h1>
            </header>

          <div className="p-4" aria-live="polite">
            {ownedItems.length > 0 ? (
              ownedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-mono-contrast p-4 mb-4 rounded-lg shadow-xl flex justify-between gap-8 flex-col sm:flex-row"
                  aria-label="User Item Card"
                >
                  <div className="flex-2 text-content">
                      <ProductDetailCard item={item}/>
                  </div>
                  {item.status === "available" && (
                    <div className="flex-2">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsEditOpen(true);
                        }}
                        className={
                          "w-full rounded bg-main-light hover:bg-main-secondary active:bg-main-primary text-mono-primary border-main-primary font-bold py-2 px-4 border-solid border-2 transition-all mt-4"
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="w-full rounded bg-alert-light hover:bg-alert-secondary active:bg-alert-primary text-mono-primary font-bold py-2 px-2 border-solid border-2 border-alert-primary transition-all mt-4"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-content">You do not own any items.</p>
            )}
          </div>
          {isEditOpen && (
            <div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center backdrop-blur-sm bg-contrast/40 transition-all">
              <div className="bg-mono-contrast p-12 rounded-xl shadow-xl w-full max-w-3xl relative max-h-[80vh] overflow-y-auto mx-4 sm:mx-0">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="absolute top-4 right-4 hover:bg-alert-light rounded-full transition-all p-3 font-bold"
                  aria-label="Close edit modal"
                >
                  <ImCross />
                  
                </button>
                <ProductForm {...(selectedItem ? { item: selectedItem } : {})} />
              </div>
            </div>
          )}
          <div className="fixed bottom-4 right-4 z-50">
            <button
              onClick={() => {
                setSelectedItem(undefined);
                setIsEditOpen(true);
              }}
              className="bg-main-light text-mono-primary px-4 py-2 rounded-full hover:bg-main-secondary active:bg-main-primary flex items-center gap-2 transition-all border-2 border-main-primary font-bold shadow-xl"
              aria-label="Add New Item"
            >
              Add New Item
            </button>
          </div>
        </div>        
      </div>




    </main>
  );
}
