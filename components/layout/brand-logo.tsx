import Image from "next/image";
import Link from "next/link";
import { LOGO_SRC } from "@/lib/images";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  href = "/",
  size = 72,
}: {
  className?: string;
  href?: string;
  size?: number;
}) {
  return (
    <Link href={href} className={cn("inline-flex shrink-0", className)} aria-label={SITE_NAME}>
      <Image
        src={LOGO_SRC}
        alt={`${SITE_NAME} logosu`}
        width={size}
        height={size}
        className="h-auto w-auto object-contain"
        priority
      />
    </Link>
  );
}
