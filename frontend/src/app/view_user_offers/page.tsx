"use client";
import { useRouter, usePathname } from "next/navigation";
import logoutUser from "@/services/user/logoutUser";
import NavBar from "@/components/NavBar";
import HeaderBar from "@/components/HeaderBar";
import useAuth from "@/hooks/useAuth";
import getUserOffers from "@/services/offer/getUserOffers";
import { useState, useEffect } from "react";
import { toTitleCase } from "@/utils/titleCase";
import { Offer } from "@/types/offer";

export default function AddOfferPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, refreshAuth } = useAuth();
  const [toggleOffer, setToggleOffer] = useState(false); // false for outgoing offers, true for incoming offers
  const [incomingOffers, setIncomingOffers] = useState<Offer[]>([]);
  const [outgoingOffers, setOutgoingOffers] = useState<Offer[]>([]);
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const requested_user_offer_response = await getUserOffers();
        setIncomingOffers(requested_user_offer_response.incomingOffers);
        setOutgoingOffers(requested_user_offer_response.outgoingOffers);
      } catch (error) {
        console.error("Error fetching requested item:", error);
      }
    };

    fetchItems();
  }, [pathname]);

  const handleLogin = async () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await logoutUser();
    refreshAuth();
    router.refresh();
  };

  const getOfferActionLabel= (toggleOffer: boolean, status: string) => {
    if(status === "cancelled") {
      return "Offer Cancelled";
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
    return "Await Other Party Action"
  };

  return (
    <div className="bg-slate-100 w-screen min-h-screen pt-16">
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

      <div className="ml-60 p-6">
        <h1 className="text-2xl font-bold mb-4 text-slate-800 px-4">
          View Offers
        </h1>

        <div className="p-4 flex flex-col sm:flex-row">
          <button
            className={`flex-1 px-4 py-2 mb-4 sm:mb-0 rounded-xl sm:rounded-none sm:rounded-l-xl text-slate-800 border-2 border-slate-400 transition-all ${!toggleOffer ? "bg-slate-400" : "bg-slate-100"}`}
            onClick={() => setToggleOffer(false)}
          >
            Outgoing Offers
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded-xl sm:rounded-none sm:rounded-r-xl text-slate-800 border-2 border-slate-400 transition-all ${toggleOffer ? "bg-slate-400" : "bg-slate-100"}`}
            onClick={() => setToggleOffer(true)}
          >
            Incoming Offers
          </button>
        </div>
        <div className="p-4">
          {(toggleOffer ? incomingOffers : outgoingOffers).length > 0 ? (
            (toggleOffer ? incomingOffers : outgoingOffers).map((offer) => (
              <div
                key={offer.id}
                className="bg-white p-4 mb-4 rounded-lg shadow flex justify-between gap-10"
              >
                <div className="flex-1">
                  <p className="text-slate-800">
                    <strong>Offered To:</strong>{" "}
                    {toTitleCase(offer.requested_item_name)}
                  </p>
                  <p className="text-slate-800">
                    <strong>Offered Items:</strong>{" "}
                    {toTitleCase(offer.offered_item_names.join(", "))}
                  </p>
                  <p className="text-slate-800">
                    <strong>Message:</strong> {toTitleCase(offer.message)}
                  </p>
                  <p className="text-slate-800">
                    <strong>Status:</strong> {toTitleCase(offer.status)}
                  </p>
                  {offer.status !== "pending" && (
                    <p className="text-slate-800">
                      <strong>Requested Item Location:</strong>{" "}
                      {toTitleCase(offer.requested_item_location)}
                    </p>
                  )}
                  <p className="text-slate-800">
                    <strong>Created At:</strong>{" "}
                    {new Date(offer.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-2">
                  <button
                    disabled={offer.status === "cancelled"}
                    className={`w-full rounded ${offer.status === "cancelled" ? "bg-red-600 text-white border-red-600" : "bg-green-600 hover:bg-green-500 text-slate-900 border-green-600"} font-bold py-2 px-4 border-solid border-2 transition-all mt-4`}
                  >
                    {getOfferActionLabel(toggleOffer, offer.status)}
                  </button>
                  {offer.status !== "cancelled" && (<button
                    className="w-full rounded bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-2 border-solid border-2 border-red-600 transition-all mt-4"
                  >
                    Cancel
                  </button>)}
                </div>
                
                
              </div>
            ))
          ) : (
            <p className="text-slate-800">
              No {toggleOffer ? "incoming" : "outgoing"} offers found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
