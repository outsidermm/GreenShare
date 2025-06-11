"use client";
import { useRouter, usePathname} from "next/navigation";
import logoutUser from "@/services/logoutUser";
import NavBar from "@/components/NavBar";
import HeaderBar from "@/components/HeaderBar";
import useAuth from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Item } from "@/types/item";
import getItems from "@/services/getItems";


export default function AddOfferPage() {
	const router = useRouter();
	const pathname = usePathname();
	const requested_item_id = pathname.replace("/add_offer/", "");
	const { isAuthenticated, refreshAuth } = useAuth();
	const [offerMessage, setOfferMessage] = useState("");
	const [outgoingItems, setOutgoingItems] = useState<Item[]>([]);
	const [offerableItems, setOfferableItems] = useState<Item[]>([]);
	const [requestedItem, setRequestedItem] = useState<Item>();
	useEffect(() => {
			const fetchItems = async () => {
				try {
					const requested_item_response = await getItems({ item_id: requested_item_id });
					if (requested_item_response.length === 1) {
						setRequestedItem(requested_item_response[0]);
					}
				} catch (error) {
					console.error("Error fetching requested item:", error);
				}
				try {
					const offerable_items_response = await getUserItems();
						setRequestedItem(offerable_items_response);
				} catch (error) {
					console.error("Error fetching user offerable item:", error);
				}
			};

			fetchItems();
		}, [pathname, requested_item_id]);


	const handleLogin = async () => {
			router.push("/login");
		};

	const handleLogout = async () => {
		await logoutUser();
		refreshAuth();
		router.refresh();
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
					<div className="flex flex-col sm:flex-row gap-6">
						<div className = "flex-1">
							<div className="shadow-lg p-4 mb-4">
								<h1 className="text-slate-800 font-bold">
								Your inventory
								</h1>
							</div>
							<div className="shadow-lg p-4 mb-4">
								<h1 className="text-slate-800 font-bold">
								Enter a message with your offer:
								</h1>
								<textarea
									className="w-full h-32 p-2 border border-slate-300 rounded"
									placeholder="Type your message here..."
									minLength={10}
									maxLength={2000}
									required
									onChange={(e) => setOfferMessage(e.target.value)}
								></textarea>
							</div>

						</div>
						<div className = "flex-1 shadow-lg p-4">
							<h1 className="text-slate-800 font-bold">
								Your inventory
							</h1>
						</div>
					</div>
				</div>
			</div>
	);


}

