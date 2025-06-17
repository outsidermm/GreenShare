"use client";

import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { IoMdCheckmark } from "react-icons/io";
import { AiOutlineShop } from "react-icons/ai";
import { useState, useEffect } from "react";
import Image from "next/image";
import LocationSelect from "@/components/LocationSelect";
import DropDown from "@/components/DropDown";
import createItem from "@/services/item/createItem";
import editItem from "@/services/item/editItem";
import swal from "sweetalert";
import { Option } from "@/types/option";
import { extractErrorMessage } from "@/utils/extractErrorMsg";
import { Item } from "@/types/item";
import { toTitleCase } from "@/utils/titleCase";
import { conditionOptions, typeOptions } from "@/types/itemDropdownOptions";

interface ProductFormProps {
  item?: Item; // Optional item prop for editing
}

export default function ProductForm(input: ProductFormProps) {
  const { item } = input;
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [isTitleChanged, setIsTitleChanged] = useState(false);

  const [description, setDescription] = useState("");
  const [isDescriptionChanged, setIsDescriptionChanged] = useState(false);

  // Store selected image files for later submission
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // Store URLs of existing images (for edit mode)
  const [imageURLs, setImageURLs] = useState<string[]>([]);

  // Pre-fill form fields if editing an item
  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setDescription(item.description || "");
      setSelectedLocation(
        item.location ? { label: item.location, value: item.location } : null,
      );
      setSelectedCondition(
        item.condition
          ? conditionOptions.find((opt) => opt.value === item.condition) || null
          : null,
      );
      setSelectedType(
        item.type
          ? typeOptions.find((opt) => opt.value === toTitleCase(item.type)) ||
              null
          : null,
      );
      setImageURLs(Array.isArray(item.images) ? item.images : []);
    }
  }, [item]);

  const [selectedCondition, setSelectedCondition] = useState<Option | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState<Option | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<Option | null>(null);

  const handleSubmit = async () => {
    try {
      if (!isAuthenticated) {
        swal("Please log in to add a product.", {
          icon: "warning",
          buttons: ["Cancel", "Login"], // [cancel, confirm]
        }).then((willLogin) => {
          if (willLogin) {
            router.push("/login");
          }
        });
        return;
      }
      if (item) {
        await editItem({
          id: item.id,
          title: title !== item.title ? title : item.title,
          description:
            description !== item.description ? description : item.description,
          condition:
            selectedCondition?.value !== item.condition
              ? selectedCondition?.value
              : item.condition,
          type:
            selectedType?.value !== item.type ? selectedType?.value : item.type,
          location:
            selectedLocation?.label !== item.location
              ? selectedLocation?.label
              : item.location,
          ...(selectedFiles.length > 0 ? { images: selectedFiles } : {}),
        }).then((response) => {
          if (response.message) {
            swal("Success!", "Product updated successfully!", "success");
            router.push("/");
          }
        });
        return;
      } else {
        if (
          !title ||
          !description ||
          !selectedCondition ||
          !selectedType ||
          !selectedLocation ||
          !selectedFiles.length
        ) {
          swal("Please fill in all fields and select at least one image.", {
            icon: "warning",
          });
          return;
        }
        await createItem({
          title,
          description,
          condition: selectedCondition.value,
          type: selectedType.value,
          location: selectedLocation.label,
          images: selectedFiles,
        }).then((response) => {
          if (response.message) {
            swal("Success!", "Product added successfully!", "success");
            router.push("/");
          }
        });
      }

      setTitle("");
      setDescription("");
      setSelectedCondition(null);
      setSelectedType(null);
      setSelectedLocation(null);
      setSelectedFiles([]);
      setIsTitleChanged(false);
      setIsDescriptionChanged(false);
    } catch (error) {
      console.error(`Error ${item ? "editing" : "creating"} item:`, error);
      if (error instanceof Error) {
        swal("Error", extractErrorMessage(error.message), "error");
      } else {
        swal(
          "Error",
          `An error occurred while ${item ? "editing" : "creating"} your item. Please try again.`,
          "error",
        );
      }
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className="p-4">
        <div className="flex justify-between flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <AiOutlineShop
              style={{ color: "var(--color-contrast-background)" }}
            />
            <h2 className="text-content text-lg font-bold">
              {item ? "Edit Product" : "Add New Product"}
            </h2>
          </div>
          <button
            type="submit"
            className="bg-action-primary text-content px-4 py-2 rounded-full hover:bg-action-secondary flex items-center gap-2 transition-all border-2 border-action-primary font-bold"
          >
            <IoMdCheckmark />
            <p>{item ? "Update Product" : "Add Product"}</p>
          </button>
        </div>
        <div className="pt-6">
          <label className="block mb-2 text-content">
            Name Product (3-100 characters)
          </label>
          <input
            type="text"
            placeholder={item ? item.title : "Enter product name"}
            minLength={3}
            maxLength={100}
            required={!item}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsTitleChanged(true)}
            className={`border-muted text-slate-600 rounded-lg py-2 px-3 w-full border-2 focus:outline-action-secondary ${isTitleChanged ? "invalid:border-alert" : ""}`}
          />
        </div>

        <div className="pt-6">
          <label className="block mb-2 text-content">
            Product Description (10-1000 characters)
          </label>
          <input
            type="text"
            placeholder={item ? item.description : "Enter product description"}
            minLength={10}
            maxLength={1000}
            required={!item}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={() => setIsDescriptionChanged(true)}
            className={`border-muted rounded-lg py-2 px-3 w-full border-2 text-slate-600 focus:outline-action-secondary ${isDescriptionChanged ? "invalid:border-alert" : ""}`}
          />
        </div>

        <div className="pt-6">
          <LocationSelect
            value={selectedLocation}
            onChange={setSelectedLocation}
            placeholder={item ? item.location : "Search for a location..."}
            required={!item}
          />
        </div>

        <div className="pt-6">
          <DropDown
            selectedOption={selectedCondition}
            setSelectedOption={setSelectedCondition}
            options={conditionOptions}
            label_text="Condition"
            placeholder={item ? item.condition : "Select Condition"}
            required={!item}
          />
        </div>

        <div className="pt-6">
          <DropDown
            selectedOption={selectedType}
            setSelectedOption={setSelectedType}
            options={typeOptions}
            label_text="Item Exchange Type"
            placeholder={item ? item.type : "Select Item Exchange Type"}
            required={!item}
          />
        </div>

        <div className="pt-6">
          <label className="block mb-2 text-content font-medium">
            Product Images
          </label>
          <div className="border-2 border-dashed border-grey-shadow rounded-lg p-4 bg-background/50">
            <input
              type="file"
              accept="image/*"
              required={!item}
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setSelectedFiles(files);
                setImageURLs([]);
              }}
              className="block w-full text-sm text-muted mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-400 file:text-content hover:file:bg-action-secondary"
            />
            {imageURLs.length > 0 || selectedFiles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imageURLs.map((url, index) => (
                  <div
                    key={`existing-${index}`}
                    className="w-full aspect-square bg-surface border rounded-lg overflow-hidden shadow-sm flex items-center justify-center"
                  >
                    <Image
                      src={url}
                      alt={`Existing Preview ${index + 1}`}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {selectedFiles.map((file, index) => (
                  <div
                    key={`new-${index}`}
                    className="w-full aspect-square bg-surface border rounded-lg overflow-hidden shadow-sm flex items-center justify-center"
                  >
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`New Preview ${index + 1}`}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-40 bg-background rounded-lg flex items-center justify-center text-muted">
                No images selected
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
