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
              }
              else {
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
    <div className="bg-background w-screen min-h-screen pt-16">
      <div className="fixed top-0 left-0 w-full bg-contrast shadow z-50 px-6 py-4 flex items-center justify-between gap-4 sm:gap-10">
        <HeaderBar
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
        />
      </div>

      <div className="z-50 fixed top-16 left-0 sm:w-60 w-full sm:h-[calc(100vh-4rem)] bg-contrast text-surface px-6 py-6 shadow-grey-shadow shadow-xl flex flex-col items-center sm:items-start sm:justify-between">
        <NavBar
          handleLogout={handleLogout}
          pathname={pathname}
          isAuthenticated={isAuthenticated}
        />
      </div>

      <div className={`sm:ml-60 sm:mt-0 p-6 ${isAuthenticated ? "mt-96 pt-20" : "mt-64"}`}>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex-1">
            <div className="shadow-lg p-4 mb-4">
              <h1 className="text-content font-bold">Your inventory</h1>
              {offerableItems.length > 0 ? (
                <ul className="list-disc pl-5">
                  {offerableItems.map((item) => {
                    const isSelected = outgoingItems.find(
                      (outItem) => outItem.id === item.id,
                    );
                    return (
                      <li
                        key={item.id}
                        className={`mb-2 p-2 text-content cursor-pointer rounded ${
                          isSelected
                            ? "bg-selected-highlight"
                            : "hover:bg-unselected-highlight"
                        }`}
                        onClick={() => {
                          if (!isSelected)
                            setOutgoingItems([...outgoingItems, item]);
                          else
                            setOutgoingItems((prev) =>
                              prev.filter((outItem) => outItem.id !== item.id),
                            );
                        }}
                      >
                        {toTitleCase(item.title)} -{" "}
                        {toTitleCase(item.description)}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-muted">You have no items to offer.</p>
              )}
            </div>
            <div className="shadow-lg p-4 mb-4">
              <h1 className="text-content font-bold">
                Enter a message with your offer:
              </h1>
              <textarea
                className="w-full h-32 p-2 border border-border rounded text-slate-600"
                placeholder="Type your message here..."
                minLength={10}
                maxLength={2000}
                required
                onChange={(e) => setOfferMessage(e.target.value)}
              ></textarea>
            </div>
          </div>
          <div className="flex-1 shadow-lg text-content w-full">
            <div className="p-4">
              <h1 className="text-content font-bold">
                Requested Item Information:
              </h1>
              {requestedItem && (
                <>
                  <p className="font-bold mb-2">
                    {toTitleCase(requestedItem.title)}
                  </p>
                  <div className="leading-relaxed space-y-1 mb-4 text-content">
                    <p><strong>Description:</strong> {toTitleCase(requestedItem.description)}</p>
                    <p><strong>Condition:</strong> {toTitleCase(requestedItem.condition)}</p>
                    <p><strong>Type:</strong> {toTitleCase(requestedItem.type)}</p>
                    <p><strong>Approximate Location:</strong> {toTitleCase(requestedItem.location).split(", ").slice(1).join(", ").trim()}</p>
                  </div>
                </>
              )}
              <h1 className="text-content font-bold">Offered Item:</h1>
              {outgoingItems.length > 0 ? (
                <ul className="list-disc pl-5">
                  {outgoingItems.map((item) => (
                    <li
                      key={item.id}
                      className="mb-2 p-2 rounded text-content cursor-pointer hover:bg-unselected-highlight"
                      onClick={() => {
                        setOutgoingItems((prev) =>
                          prev.filter((outItem) => outItem.id !== item.id),
                        );
                      }}
                    >
                      {toTitleCase(item.title)} -{" "}
                      {toTitleCase(item.description)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-content">You offered no items.</p>
              )}
              <button
                onClick={() => handleOfferSubmit()}
                className="w-full rounded bg-action-primary hover:bg-action-secondary text-contrast font-bold py-2 px-4 border-solid border-2 border-action-primary transition-all mt-4"
              >
                Make an Offer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
