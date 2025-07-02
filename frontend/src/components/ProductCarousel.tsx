import Image from "next/image";
import {FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { Carousel } from "react-responsive-carousel";
import { Item } from "@/types/item";

interface ProductCarouselProps {
  item: Item;
  aspectRatio: string;
}

export default function ProductCarousel(input: ProductCarouselProps) {
  const { item, aspectRatio } = input;
  return (
    <Carousel
      showArrows={item.images.length > 1}
      showIndicators={item.images.length > 1}
      infiniteLoop={item.images.length > 1}
      dynamicHeight={false}
      showThumbs={false}
      showStatus={false}
      className="w-full rounded-xl"
      renderArrowPrev={(onClickHandler, hasPrev, label) =>
        hasPrev && (
          <button
            type="button"
            onClick={onClickHandler}
            title={label}
            className="absolute z-10 left-2 top-1/2 bg-mono-contrast text-mono-primary rounded-full p-2 shadow-md hover:bg-mono-ascent hover:text-mono-contrast transition-all"
          >
            <FaChevronLeft />
          </button>
        )
      }
      renderArrowNext={(onClickHandler, hasNext, label) =>
        hasNext && (
          <button
            type="button"
            onClick={onClickHandler}
            title={label}
            className="absolute z-10 right-2 top-1/2 bg-mono-contrast text-mono-primary rounded-full p-2 shadow-md hover:bg-mono-ascent hover:text-mono-contrast transition-all"
          >
            <FaChevronRight />
          </button>
        )
      }
      renderIndicator={(onClickHandler, isSelected, index, label) => {
        const baseStyle =
          "inline-block w-3 h-3 mx-1 rounded-full transition-all";
        const selectedStyle = "bg-main-primary";
        const unselectedStyle = "bg-mono-contrast";
        return (
          <li
            className={`${baseStyle} ${isSelected ? selectedStyle : unselectedStyle}`}
            onClick={onClickHandler}
            key={index}
            title={label}
            role="button"
            tabIndex={0}
            aria-label={`Slide ${index + 1}`}
          />
        );
      }}
    >
      {item.images.map((image, index) => (
        <div
          key={index}
          className={`relative w-full aspect-[${aspectRatio}] bg-mono-contrast-light overflow-hidden rounded-xl`}
        >
          <Image
            src={image}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain"
            priority={true}
          />
        </div>
      ))}
    </Carousel>
  );
}
