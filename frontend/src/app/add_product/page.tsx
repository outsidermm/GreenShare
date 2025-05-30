"use client";

import useAuth from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import logoutUser from "@/services/logoutUser";
import NavBar from "@/components/NavBar";
import HeaderBar from "@/components/HeaderBar";
import { IoMdCheckmark } from "react-icons/io";
import { AiOutlineShop } from "react-icons/ai";
import { useState } from "react";
import Image from "next/image";
import LocationSelect from "@/components/LocationSelect";
import DropDown from "@/components/DropDown";

export interface Option {
  value: string;
  label: string;
}

export default function Home() {
  const { isAuthenticated, refreshAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [title, setTitle] = useState("");
  const [isTitleChanged, setIsTitleChanged] = useState(false);

  const [description, setDescription] = useState("");
  const [isDescriptionChanged, setIsDescriptionChanged] = useState(false);

  // Store selected image files for later submission
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const conditionOptions: Array<Option> = [
    { value: "new", label: "New" },
    { value: "like-new", label: "Like New" },
    { value: "used-good", label: "Used - Good" },
    { value: "used-fair", label: "Used - Fair" },
    { value: "poor", label: "Poor" },
  ];

  const typeOptions: Array<Option> = [
    { value: "Free", label: "Free to Claim" },
    { value: "Exchange", label: "Exchange via Offer" },
  ];

  const [selectedCondition, setSelectedCondition] = useState<Option | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState<Option | null>(null);

  const categories = [
    { label: "Essentials", path: "/category/essentials" },
    { label: "Living", path: "/category/living" },
    { label: "Tools & Tech", path: "/category/tools-tech" },
    { label: "Style & Expression", path: "/category/style-expression" },
    { label: "Leisure & Learning", path: "/category/leisure-learning" },
  ];

  const [selectedLocation, setSelectedLocation] = useState<Option | null>(null);

  const handleLogin = async () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await logoutUser();
    refreshAuth();
    router.refresh();
  };

  const handleSubmit = async () => {};

  return (
    <>
      <div className="bg-slate-100 w-screen min-h-screen pt-16">
        <div className="fixed top-0 left-0 w-full bg-slate-900 shadow z-50 px-6 py-4 flex items-center justify-between gap-4 sm:gap-10">
          <HeaderBar
            isAuthenticated={isAuthenticated}
            handleLogin={handleLogin}
          />
        </div>

        <div className="fixed top-16 left-0 w-60 h-[calc(100vh-4rem)] bg-slate-900 text-white px-6 py-6 shadow-slate-400 shadow-xl flex flex-col justify-between">
          <NavBar
            categories={categories}
            handleLogout={handleLogout}
            pathname={pathname}
            isAuthenticated={isAuthenticated}
          />
        </div>

        <div className="ml-60 p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="flex justify-between p-2 pb-6">
              <div className="flex items-center gap-2">
                <AiOutlineShop color="black" />
                <h2 className="text-slate-800 text-lg font-bold">
                  Add New Product
                </h2>
              </div>
              <button
                type="submit"
                className="bg-green-400 text-slate-800 px-4 py-2 rounded-full hover:bg-green-500 flex items-center gap-2 transition-all"
              >
                <IoMdCheckmark />
                <p>Add Product</p>
              </button>
            </div>
            <div className="bg-white shadow-slate-200 shadow-sm rounded-2xl p-4 mx-4">
              <h2 className="text-slate-800 font-extrabold">
                {" "}
                General Information{" "}
              </h2>
              <div className="pt-6">
                <label className="block mb-2 text-slate-800">
                  Name Product (3-100 characters)
                </label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  minLength={3}
                  maxLength={100}
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => setIsTitleChanged(true)}
                  className={`border-slate-500 text-slate-500 rounded-lg py-2 px-3 w-full border-2  focus:outline-green-500 ${isTitleChanged ? "invalid:border-red-500" : ""}`}
                />
              </div>

              <div className="pt-6">
                <label className="block mb-2 text-slate-800">
                  Product Description (10-1000 characters)
                </label>
                <input
                  type="text"
                  placeholder="Enter product description"
                  minLength={10}
                  maxLength={1000}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => setIsDescriptionChanged(true)}
                  className={`border-slate-500 rounded-lg py-2 px-3 w-full border-2 text-slate-500 focus:outline-green-500 ${isDescriptionChanged ? "invalid:border-red-500" : ""}`}
                />
              </div>

              <div className="pt-6">
                <LocationSelect
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                />
              </div>

              <div className="pt-6">
                <DropDown
                  selectedOption={selectedCondition}
                  setSelectedOption={setSelectedCondition}
                  options={conditionOptions}
                  label_text="Condition"
                  placeholder="Select product condition"
                />
              </div>

              <div className="pt-6">
                <DropDown
                  selectedOption={selectedType}
                  setSelectedOption={setSelectedType}
                  options={typeOptions}
                  label_text="Item Exchange Type"
                  placeholder="Select Item Exchange Type"
                />
              </div>

              <div className="pt-6">
                <label className="block mb-2 text-slate-800 font-medium">
                  Product Images
                </label>
                <div className="border-2 border-dashed border-slate-400 rounded-lg p-4 bg-slate-50">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setSelectedFiles(files);
                    }}
                    className="block w-full text-sm text-slate-600 mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-400 file:text-slate-800 hover:file:bg-green-500"
                  />
                  {selectedFiles.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="w-full aspect-square bg-white border rounded-lg overflow-hidden shadow-sm flex items-center justify-center"
                        >
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      No images selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
