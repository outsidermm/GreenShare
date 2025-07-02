"use client";
/**
 * Manage Offers Page for users on GreenShare.
 * Allows users to view and manage their incoming and outgoing offers.
 */
import { useRouter, usePathname } from "next/navigation";
import logoutUser from "@/services/user/logoutUser";
import NavBar from "@/components/NavBar";
import HeaderBar from "@/components/HeaderBar";
import useAuth from "@/hooks/useAuth";
import getUserOffers from "@/services/offer/getUserOffers";
import { useState, useEffect } from "react";
import { toTitleCase } from "@/utils/titleCase";
import { Offer } from "@/types/offer";
import cancelOffer from "@/services/offer/cancelOffer";
import acceptOffer from "@/services/offer/acceptOffer";
import completeOffer from "@/services/offer/completeOffer";
import confirmOfferComplete from "@/services/offer/confirmOfferComplete";
import swal from "sweetalert";
import { extractErrorMessage } from "@/utils/extractErrorMsg";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

export default function ManageOffersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, refreshAuth } = useAuth();
  const [toggleOffer, setToggleOffer] = useState(false); // false for outgoing offers, true for incoming offers
  const [incomingOffers, setIncomingOffers] = useState<Offer[]>([]);
  const [outgoingOffers, setOutgoingOffers] = useState<Offer[]>([]);

  // Fetches and sets incoming/outgoing offers on page load and handles authentication redirection.
  useEffect(() => {
    (async () => {
      try {
        const requested_user_offer_response = await getUserOffers();
        setIncomingOffers(requested_user_offer_response.incomingOffers);
        setOutgoingOffers(requested_user_offer_response.outgoingOffers);
      } catch (error) {
        console.error("Error fetching requested offers:", error);
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

  // Handler to navigate to login page.
  const handleLogin = async () => {
    router.push("/login");
  };

  // Handler to log out the user and refresh authentication state.
  const handleLogout = async () => {
    await logoutUser();
    refreshAuth();
    router.refresh();
  };

  // Determines the button label based on offer status.
  const getOfferActionLabel = (toggleOffer: boolean, status: string) => {
    if (status === "cancelled") {
      return "Offer Cancelled";
    }

    if (status === "confirmed") {
      return "Exchange Complete and Confirmed";
    }

    if (toggleOffer) {
      if (status === "pending") {
        return "Accept Offer";
      } else if (status === "completed") {
        return "Confirm Offer Completion";
      }
    } else {
      if (status === "accepted") {
        return "Complete Offer";
      }
    }
    return "Await Other Party Action";
  };

  // Handles actions performed by the current user on an offer based on its status.
  const handleCurrentUserOfferAction = async (
    offer: Offer,
    toggleOffer: boolean,
  ) => {
    try {
      if (toggleOffer) {
        if (offer.status === "pending") {
          await acceptOffer(offer.id);
          swal(
            "Offer Accepted",
            "You have accepted the offer. Please wait for the other party to complete the exchange.",
            "success",
          );
        } else if (offer.status === "completed") {
          await confirmOfferComplete(offer.id);
          swal(
            "Offer Completed",
            "You have confirmed the completion of the offer. Thank you for using GreenShare!",
            "success",
          );
        }
      } else {
        if (offer.status === "accepted") {
          await completeOffer(offer.id);
          swal(
            "Offer Completed",
            "You have completed the offer. Please wait for the other party to confirm completion.",
            "success",
          );
        }
      }
      router.push("/manage_offers");
    } catch (error) {
      console.error("Error performing actions on your offer:", error);
      if (error instanceof Error) {
        swal("Error", extractErrorMessage(error.message), "error");
      } else {
        swal("Error", "Failed to pursue actions on offer.", "error");
      }
    }
  };

  // Handles cancelling an offer with a reason provided by the user.
  const handleCancel = async (offerId: number) => {
    try {
      const message = await swal({
        title: "Cancel Offer?",
        text: "Provide a reason for cancelling the offer:",
        content: {
          element: "input",
          attributes: {
            placeholder: "Reason for cancelling...",
            type: "text",
            className:
              "border-mono-secondary rounded-lg py-2 px-3 w-full border-2 text-mono-secondary focus:outline-action-secondary",
          },
        },
        buttons: ["No", "Yes"],
      });

      if (typeof message === "string") {
        if (message.length < 10 || message.length > 1000) {
          swal(
            "Invalid Reason",
            "Please provide a reason between 10 and 1000 characters.",
            "warning",
          );
          return;
        }
        await cancelOffer({ offerId, message });
        router.refresh();
      }
    } catch (error) {
      console.error("Error cancelling offer:", error);
      if (error instanceof Error) {
        swal("Error", extractErrorMessage(error.message), "error");
      } else {
        swal("Error", "Failed to cancel the offer. Please try again.", "error");
      }
    }
  };

  return (
    <main
      className="bg-mono-contrast-light w-screen min-h-screen pt-16"
      role="main"
      aria-label="Manage Offers Page"
    >
      <div className="fixed top-0 left-0 w-full bg-mono-contrast shadow z-50 px-6 py-4 flex items-center justify-between gap-4 sm:gap-10">
        <HeaderBar
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
        />
      </div>
      <div>
        <div className="z-40 fixed top-16 left-0 sm:w-60 w-full sm:h-[calc(100vh-4rem)] bg-mono-contrast text-mono-light px-2 py-6 shadow-xl flex flex-col items-center sm:items-start sm:justify-between">
          <NavBar
            handleLogout={handleLogout}
            pathname={pathname}
            isAuthenticated={isAuthenticated}
          />
        </div>

        <section
          aria-labelledby="view-offers-heading"
          className="sm:ml-60 sm:mt-0 p-6 mt-96 pt-8"
        >
          <h1
            id="view-offers-heading"
            className="text-2xl font-bold mb-4 text-mono-primary px-4"
          >
            View Offers
          </h1>

          <div className="p-4 flex flex-col sm:flex-row">
            <button
              aria-label="Show Outgoing Offers"
              aria-disabled={!toggleOffer}
              className={`flex-1 px-4 py-2 mb-4 sm:mb-0 rounded-xl sm:rounded-none sm:rounded-l-xl border-2 transition-all ${
                !toggleOffer
                  ? "bg-mono-primary text-mono-contrast border-mono-primary"
                  : "bg-mono-contrast-light text-mono-secondary border-mono-primary hover:bg-mono-secondary active:bg-mono-primary"
              }`}
              onClick={() => setToggleOffer(false)}
            >
              Outgoing Offers
            </button>
            <button
              aria-label="Show Incoming Offers"
              aria-disabled={toggleOffer}
              className={`flex-1 px-4 py-2 rounded-xl sm:rounded-none sm:rounded-r-xl border-2 transition-all ${
                toggleOffer
                  ? "bg-mono-primary text-mono-contrast border-mono-primary"
                  : "bg-mono-contrast-light text-mono-secondary border-mono-primary hover:bg-mono-secondary active:bg-mono-primary"
              }`}
              onClick={() => setToggleOffer(true)}
            >
              Incoming Offers
            </button>
          </div>
          <div className="p-4">
            {/* Dynamic rendering of each offer card */}
            {(toggleOffer ? incomingOffers : outgoingOffers).length > 0 ? (
              (toggleOffer ? incomingOffers : outgoingOffers).map((offer) => (
                <div
                  key={offer.id}
                  role="region"
                  aria-label="Offer Card"
                  className="bg-mono-contrast p-6 mb-6 rounded-lg shadow-xl flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                >
                  {/* Items */}
                  <div className="flex-1">
                    <h2 className="font-bold mb-2 text-mono-primary text-xl">
                      Items
                    </h2>
                    <p className="font-semibold text-mono-primary">Incoming</p>
                    <div className="flex items-center text-mono-primary gap-1">
                      <FaArrowRight color="green" />
                      <p>{toTitleCase(offer.requested_item_name)}</p>
                    </div>
                    <hr className="my-2 border-mono-secondary" />
                    <p className="font-semibold text-mono-primary">Outgoing</p>
                    <div className="flex items-center text-mono-primary gap-1">
                      <FaArrowLeft color="red" />
                      {offer.offered_item_names.map((item, index) => (
                        <p
                          key={index}
                          className="text-mono-primary flex items-center gap-1"
                        >
                          {toTitleCase(item)}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Message and Location */}
                  <div className="flex-1 text-mono-primary">
                    <h2 className="font-bold mb-1 text-xl">Message</h2>
                    <p className="mb-4">{toTitleCase(offer.message)}</p>
                    <h2 className="font-bold mb-1 text-xl">Location</h2>
                    <p>{(!toggleOffer && offer.status === "pending") ? toTitleCase(offer.requested_item_location.split(", ").slice(1).join(", ").trim()) : toTitleCase(offer.requested_item_location)}</p>
                  </div>

                  {/* Stage */}
                  <div className="flex-1">
                    <h2 className="font-bold mb-2 text-mono-primary text-xl">
                      Stage
                    </h2>
                    {["confirmed", "completed", "accepted", "pending"].map(
                      (stage) => (
                        <p
                          key={stage}
                          className={`flex items-center ${offer.status === stage ? "font-bold text-main-primary" : "text-mono-secondary"}`}
                        >
                          {offer.status === stage ? (
                            <span className="inline-block w-3 h-3 rounded-full bg-main-primary mr-2" />
                          ) : (
                            <span className="inline-block w-2 h-2 mr-2 rounded-full bg-mono-secondary" />
                          )}
                          {toTitleCase(stage)}
                        </p>
                      ),
                    )}
                  </div>

                  {/* Next Action */}
                  <div className="flex-1">
                    <h2 className="font-bold mb-2 text-mono-primary text-xl">
                      Next Action
                    </h2>
                    <button
                      disabled={offer.status === "cancelled"}
                      aria-disabled={offer.status === "cancelled"}
                      onClick={() =>
                        handleCurrentUserOfferAction(offer, toggleOffer)
                      }
                      className={`w-full rounded text-mono-primary font-bold py-2 px-4 border-solid border-2 transition-all
                        ${
                          offer.status === "cancelled"
                            ? "bg-alert-light border-alert-primary"
                            : "bg-main-light hover:bg-main-secondary active:bg-main-primary border-main-primary"
                        }
                      `}
                    >
                      {getOfferActionLabel(toggleOffer, offer.status)}
                    </button>
                    {offer.status === "pending" && (
                      <button
                        className="w-full rounded bg-alert-light hover:bg-alert-secondary active:bg-alert-primary text-mono-primary font-bold py-2 px-2 border-solid border-2 border-alert-primary transition-all mt-4"
                        onClick={() => handleCancel(offer.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-mono-primary">
                No {toggleOffer ? "incoming" : "outgoing"} offers found.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
