import Image from "next/image";
import Link from "next/link";
import { LOGO_SRC } from "@/lib/images";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  href = "/",
  size = 72,
  priority = false,
}: {
  className?: string;
  href?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      aria-label={SITE_NAME}
      style={{ width: size, height: size }}
    >
      <Image
        src={LOGO_SRC}
        alt={`${SITE_NAME} logosu`}
        width={size}
        height={size}
        className="h-full w-full object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
        priority={priority}
      />
    </Link>
  );
}
