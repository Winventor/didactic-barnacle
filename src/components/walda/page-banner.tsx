import Image from "next/image";

interface PageBannerProps {
  src: string;
  positionX?: number;
  alt?: string;
}

export function PageBanner({
  src,
  positionX = 0.5,
  alt = "Walda Coaching",
}: PageBannerProps) {
  return (
    <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden border-b border-border/60">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className="object-cover"
        style={{ objectPosition: `${positionX * 100}% center` }}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
    </div>
  );
}
