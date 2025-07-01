import Link from "next/link";
import Image from "next/image";
import { toTitleCase } from "@/utils/titleCase";
import { Item } from "@/types/item";

export default function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      key={item.id}
      href={`/view_product/${item.id}`}
      prefetch={true}
      aria-label={`View details for ${item.title}`}
    >
      <div className="bg-surface rounded-xl shadow p-4 cursor-pointer hover:shadow-lg transition-all h-full">
        <Image
          src={item.images[0]}
          alt={item.title}
          width={200}
          height={200}
          className="w-full h-32 object-cover mb-3 rounded"
        />
        <h4 className="text-content font-bold">
          {toTitleCase(item.title)}
        </h4>
        <p className="text-hyperlink">
          {toTitleCase(item.condition)}
        </p>
        <p className="text-muted">{toTitleCase(item.type)}</p>
      </div>
    </Link>
  );
}