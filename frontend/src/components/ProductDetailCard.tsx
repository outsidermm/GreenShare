import { Item } from "@/types/item";
import { toTitleCase } from "@/utils/titleCase";


export default function ProductDetailCard({ item, approximate_loc = false }: { item: Item , approximate_loc?: boolean }) {
  return (
    <div>
      <header>
        <div className="flex flex-row gap-4 items-center">
          <h1 className="text-2xl font-bold text-contrast">
            {toTitleCase(item.title)}
          </h1>
          <p className="text-action-secondary border-action-secondary rounded-2xl border-2 px-4 text-sm">
            {toTitleCase(toTitleCase(item.category))}
          </p>
        </div>

      </header>

      <div className= "border-l-2 border-action-primary text-base pl-4 space-y-1">
        <p>
          {toTitleCase(item.description)}
        </p>
        <p>
          {toTitleCase(approximate_loc
            ? item.location.split(", ").slice(1).join(", ").trim()
            : item.location)}
        </p>
        <div className="flex flex-row gap-2 flex-wrap items-center">
          <p className="text-action-primary border-action-hover bg-action-hover rounded-2xl border-2 px-4 text-sm">
          {toTitleCase(toTitleCase(item.type))}
          </p>
          <p className="text-action-primary border-action-hover bg-action-hover rounded-2xl border-2 px-4 text-sm">
          {toTitleCase(toTitleCase(item.status))}
          </p>
          <p className="text-action-primary border-action-hover bg-action-hover rounded-2xl border-2 px-4 text-sm">
          {toTitleCase(toTitleCase(item.condition))}
          </p>
        </div>
      </div>
    </div>
  );
}