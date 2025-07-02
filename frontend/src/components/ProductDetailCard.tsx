import { Item } from "@/types/item";
import { toTitleCase } from "@/utils/titleCase";


export default function ProductDetailCard({ item, approximate_loc = false }: { item: Item , approximate_loc?: boolean }) {
  return (
    <div>
      <header>
        <div className="flex flex-row gap-4 items-center">
          <h1 className="text-2xl font-bold text-contrast break-words whitespace-normal">
            {toTitleCase(item.title)}
          </h1>
          <p className="text-main-primary border border-main-primary rounded-2xl px-4 break-words whitespace-normal">
            {toTitleCase(toTitleCase(item.category))}
          </p>
        </div>

      </header>

      <div className= "border-l-2 border-main-secondary pl-4 space-y-1">
        <p className="break-words whitespace-normal">
          {toTitleCase(item.description)}
        </p>
        <p className="break-words whitespace-normal">
          {toTitleCase(approximate_loc
            ? item.location.split(", ").slice(1).join(", ").trim()
            : item.location)}
        </p>
        <div className="flex flex-row gap-2 flex-wrap items-center">
          <p className="bg-main-light text-main-primary border-l-1 border-main-primary rounded-2xl px-4 break-words whitespace-normal">
            {toTitleCase(toTitleCase(item.type))}
          </p>
          <p className="bg-main-light text-main-primary border-l-1 border-main-primary rounded-2xl px-4 break-words whitespace-normal">
            {toTitleCase(toTitleCase(item.status))}
          </p>
          <p className="bg-main-light text-main-primary border-l-1 border-main-primary rounded-2xl px-4 break-words whitespace-normal">
            {toTitleCase(toTitleCase(item.condition))}
          </p>
        </div>
      </div>
    </div>
  );
}