"use client";
import { useRouter, usePathname } from "next/navigation";
import logoutUser from "@/services/user/logoutUser";
import NavBar from "@/components/NavBar";
import HeaderBar from "@/components/HeaderBar";
import useAuth from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Item } from "@/types/item";
import getItems from "@/services/item/getItems";
import getUserItems from "@/services/item/getUserItems";
import { toTitleCase } from "@/utils/titleCase";
import swal from "sweetalert";
import createOffer from "@/services/offer/createOffer";
import { extractErrorMessage } from "@/utils/extractErrorMsg";
import ProductDetailCard from "@/components/ProductDetailCard";
import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import { FaChevronLeft, FaMinus } from "react-icons/fa6";
import { ImCross } from "react-icons/im";

export default function AddOfferPage() {
  const router = useRouter();
  const pathname = usePathname();
  const requested_item_id = Number(pathname.replace("/add_offer/", ""));
  if (isNaN(requested_item_id)) {
    throw new Error("Invalid item ID in URL");
  }
  const { isAuthenticated, refreshAuth } = useAuth();
  const [offerMessage, setOfferMessage] = useState("");
  const [outgoingItems, setOutgoingItems] = useState<Item[]>([]);
  const [offerableItems, setOfferableItems] = useState<Item[]>([]);
  const [requestedItem, setRequestedItem] = useState<Item>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch requested item and user's offerable items on component mount or when dependencies change
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const requested_item_response = await getItems({
          item_id: requested_item_id,
        });
        if (requested_item_response.length === 1) {
          setRequestedItem(requested_item_response[0]);
        } else {
          throw new Error(
            "Requested item not found or multiple item returned.",
          );
        }
      } catch (error) {
        console.error("Error fetching requested item:", error);
      }
      try {
        const offerable_items_response = await getUserItems();
        setOfferableItems(offerable_items_response);
      } catch (error) {
        console.error("Error fetching user offerable item:", error);
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
    };

    fetchItems();
  }, [pathname, requested_item_id, isAuthenticated, router]);

  const handleLogin = async () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await logoutUser();
    refreshAuth();
    router.refresh();
  };

  // Handle offer submission with validation and feedback
  const handleOfferSubmit = async () => {
    try {
      if (
        requestedItem &&
        requestedItem.type === "free" &&
        outgoingItems.length > 0
      ) {
        swal("You cannot offer items for a free item.", {
          icon: "warning",
          buttons: ["Cancel", "OK"],
        }).then((ack) => {
          if (ack) {
            setOutgoingItems([]);
          }
        });
      } else if (
        requestedItem &&
        requestedItem.type === "exchange" &&
        outgoingItems.length === 0
      ) {
        swal("You cannot offer nothing for an exchange item.", {
          icon: "warning",
          buttons: ["Cancel", "OK"],
        });
      }
      if (requestedItem) {
        await createOffer({
          requestedItemId: requestedItem.id,
          offeredItemIds: outgoingItems.map((item) => item.id),
          message: offerMessage,
        }).then((response) => {
          if (response.message) {
            swal("Success!", "Offer submitted successfully!", "success");
            router.push("/");
          }
        });
      }
    } catch (error) {
      console.error("Error submitting offer:", error);
      if (error instanceof Error) {
        swal("Error", extractErrorMessage(error.message), "error");
      } else {
        swal(
          "Error",
          "An error occurred while submitting your offer. Please try again.",
          "error",
        );
      }
    }
  };

  return (
    <main className="bg-mono-light w-screen min-h-screen pt-16" role="main">
      {/* Top fixed header containing authentication and site branding */}
      <div className="fixed top-0 left-0 w-full bg-mono-contrast shadow z-50 px-6 py-4 flex items-center justify-between gap-4 sm:gap-10">
        <HeaderBar
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
        />
      </div>

      <nav
        className="z-40 fixed top-16 left-0 sm:w-60 w-full sm:h-[calc(100vh-4rem)] bg-mono-contrast text-mono-primary px-2 py-6 shadow-xl flex flex-col items-center sm:items-start sm:justify-between"
        aria-label="Main navigation"
      >
        <NavBar
          handleLogout={handleLogout}
          pathname={pathname}
          isAuthenticated={isAuthenticated}
        />
      </nav>

      {/* Main content area showing inventory, message input, and requested item information */}
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
          <p className="font-bold">
            Make an Offer
          </p>
        </div>
          {requestedItem ? <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 flex justify-center items-center">
            {/* Carousel displaying images of the selected item */}
              <Carousel
                showArrows={requestedItem.images.length > 1}
                showIndicators={requestedItem.images.length > 1}
                infiniteLoop={requestedItem.images.length > 1}
                dynamicHeight={false}
                showThumbs={false}
                className="w-full rounded-xl"
              >
              {requestedItem.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative w-full aspect-[5/3] bg-mono-contrast-light overflow-hidden rounded-xl"
                  >
                    <Image
                      src={image}
                      alt={requestedItem.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-contain"
                      priority={true}
                    />
                  </div>
                ))}
            </Carousel>
          </div>
          <div className="flex-1 justify-center flex-col flex" aria-live="polite">
            {/* Product detail card displaying item information */}
              <ProductDetailCard item={requestedItem} approximate_loc={true}/>
          </div>
        </div>
        : (<p>Item not found.</p>)  
        }
        <div className="flex flex-col gap-8 mt-10">
            <div className="shadow-lg p-4 bg-mono-contrast relative rounded-xl">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <h1 className="text-mono-primary font-bold text-2xl">Offered Item</h1>
                <button
                  onClick={() => {setIsModalOpen(true)}}
                  className="bg-main-light hover:bg-main-secondary text-mono-primary font-bold py-2 px-4 border-solid border-2 border-main-primary transition-all rounded-full"
                  aria-label="Add Items to Offer"
                >
                  Add Items to Offer
                </button>
              </div>
              {outgoingItems.length > 0 ? (
                <ul className="list-disc pl-5 mt-4">
                  {outgoingItems.map((item) => {
                    return (
                      <li key={item.id} className="mb-2">
                        <div className="flex flex-col sm:flex-row justify-between items-center">
                          <p className="text-mono-primary">
                            {toTitleCase(item.title)} -{" "}
                            {toTitleCase(item.description)}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                                setOutgoingItems((prev) =>
                                  prev.filter(
                                    (outItem) => outItem.id !== item.id,
                                  ),
                                );
                            }}
                            className={"text-left p-2 text-mono-primary cursor-pointer rounded hover:bg-alert transition-all"}
                            aria-label={`{Deselect item ${toTitleCase(item.title)} - ${toTitleCase(item.description)}`}
                          >
                            <FaMinus />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-mono-secondary">You have no items to offer.</p>
              )}
            </div>
            <div className="shadow-lg p-4 bg-mono-contrast rounded-xl">
              <h1 className="text-mono-primary font-bold text-2xl">Offer Message</h1>
              <h1 className="text-mono-primary mt-2">
                Enter a message with your offer:
              </h1>
              <textarea
                aria-label="Offer message" // Describes the purpose of the textarea for screen readers
                className="w-full h-32 p-2 border border-mono-secondary rounded text-mono-primary"
                placeholder="Type your message here..."
                minLength={10}
                maxLength={2000}
                required
                onChange={(e) => setOfferMessage(e.target.value)}
              ></textarea>
            </div>
            <button
              aria-label="Submit offer" // Clarifies button action for screen readers
              onClick={() => handleOfferSubmit()}
              className="w-full rounded-xl bg-main-light hover:bg-main-secondary text-mono-primary font-bold py-2 px-4 border-solid border-2 border-main-primary transition-all mt-2 shadow-lg"
              >
              Make an Offer
            </button>
          </div>
          {isModalOpen && (
            <div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center backdrop-blur-sm bg-mono-contrast/40 transition-all">
              <div className="bg-mono-contrast p-12 rounded-xl shadow-xl w-full max-w-3xl relative max-h-[80vh] overflow-y-auto">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 hover:bg-alert-light font-bold rounded-full p-2 transition-all"
                  aria-label="Close edit modal"
                >
                  <ImCross />
                </button>
                <h1 className="text-mono-primary font-bold text-2xl">Your Inventory</h1>
                {offerableItems.length > 0 ? (
                  <ul className="pl-2 mt-4">
                    {offerableItems.map((item) => {
                      const isSelected = outgoingItems.find(
                        (outItem) => outItem.id === item.id,
                      );
                      return (
                        <li key={item.id} className="mb-2">
                          <label className="flex items-center gap-4 cursor-pointer p-2 rounded w-full transition-all hover:bg-main-ascent">
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => {
                                if (!isSelected)
                                  setOutgoingItems([...outgoingItems, item]);
                                else
                                  setOutgoingItems((prev) =>
                                    prev.filter((outItem) => outItem.id !== item.id),
                                  );
                              }}
                              className="accent-main-primary"
                              aria-label={`${
                                isSelected ? "Deselect" : "Select"
                              } item ${toTitleCase(item.title)} - ${toTitleCase(item.description)}`}
                            />
                            <span className="text-mono-primary leading-tight">
                              {toTitleCase(item.title)} - {toTitleCase(item.description)}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-mono-secondary">You have no items to offer.</p>
                )}
              </div>
            </div>
          )}
        </div>
    </main>
  );
}
