"use client";
import useAuth from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import logoutUser from "@/services/user/logoutUser";
import NavBar from "@/components/NavBar";
import HeaderBar from "@/components/HeaderBar";
import { useEffect, useState } from "react";
import getItems from "@/services/item/getItems";
import { FaChevronLeft } from "react-icons/fa6";
import "swiper/css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import swal from "sweetalert";
import { Item } from "@/types/item";
import ProductDetailCard from "@/components/ProductDetailCard";
import ProductCarousel from "@/components/ProductCarousel";

export default function ViewProductPage() {
  // Extract authentication state and refresh function from custom hook
  const { isAuthenticated, refreshAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [item, setItem] = useState<Item>();
  const item_id_filter = Number(pathname.replace("/view_product/", ""));

  // Fetch the specific item based on item_id from URL and prefetch the offer page
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await getItems({ item_id: item_id_filter });
        if (response.length === 1) {
          setItem(response[0]);
        }
        router.prefetch(`/add_offer/${item_id_filter}`);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [pathname, item_id_filter, router]);

  const handleLogin = async () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await logoutUser();
    refreshAuth();
    router.refresh();
  };

  const handleOffer = () => {
    if (isAuthenticated) {
      router.push(`/add_offer/${item_id_filter}`);
    } else {
      swal("Please log in to make an offer.", {
        icon: "warning",
        buttons: ["Cancel", "Login"], // [cancel, confirm]
      }).then((willLogin) => {
        if (willLogin) {
          router.push("/login");
        }
      });
    }
  };

  return (
    <main
      role="main"
      aria-label="Product Detail Page"
      className="bg-mono-light w-screen min-h-screen pt-16"
    >
      <div className="fixed top-0 left-0 w-full bg-mono-contrast shadow z-50 px-6 py-4 flex items-center justify-between gap-4 sm:gap-10">
        <HeaderBar
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
        />
      </div>

      <div className="z-49 fixed top-16 left-0 sm:w-60 w-full sm:h-[calc(100vh-4rem)] bg-mono-contrast text-mono-primary px-2 py-6 shadow-grey-shadow shadow-xl flex flex-col items-center sm:items-start sm:justify-between">
        <NavBar
          handleLogout={handleLogout}
          pathname="/"
          isAuthenticated={isAuthenticated}
        />
      </div>

      <div
        className={`sm:ml-60 sm:pt-6 sm:mt-0 p-6 ${isAuthenticated ? "mt-96 pt-20" : "mt-64"}`}
      >
        <div className="mb-4 flex flex-row items-center gap-4">
          <button
            onClick={() => router.back()}
            className="cursor-pointer w-fit p-2 hover:bg-mono-ascent rounded-full transition-all"
            aria-label="Back to previous page"
          >
            <FaChevronLeft color="contrast" size={16} />
          </button>
          <p className="font-bold">Product Information</p>
        </div>
        {item ? (
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 flex justify-center items-center">
              {/* Carousel displaying images of the selected item */}
              <ProductCarousel item={item} mode="width-full" />
            </div>
            <div
              className="flex-1 flex flex-col gap-4 justify-center"
              aria-live="polite"
            >
              {/* Product detail card displaying item information */}
              <ProductDetailCard item={item} approximate_loc={true} />
              <div className="pt-10 p-6">
                {/* Button to initiate offer; redirects based on authentication status */}
                <button
                  onClick={handleOffer}
                  className="w-full rounded bg-main-light hover:bg-main-secondary text-mono-primary font-bold py-2 px-4 border-solid border-2 border-main-primary transition-all"
                  aria-label="Make an offer on this item"
                >
                  Make an Offer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p>Item not found.</p>
        )}
      </div>
    </main>
  );
}
