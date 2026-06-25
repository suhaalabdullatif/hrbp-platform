import wordmarkWhite from "@/assets/brand/humain-wordmark-white.png";
import wordmarkBlack from "@/assets/brand/humain-wordmark-black.png";
import { cn } from "@/lib/utils";

type WordmarkVariant = "white" | "black";

interface WordmarkProps {
  variant?: WordmarkVariant;
  className?: string;
}

/**
 * HUMAIN wordmark. Use `white` on dark surfaces, `black` on light surfaces.
 * The native artwork has a fixed aspect ratio (~6.5:1); size via height utilities.
 */
export function Wordmark({ variant = "black", className }: WordmarkProps) {
  return (
    <img
      src={variant === "white" ? wordmarkWhite : wordmarkBlack}
      alt="HUMAIN"
      className={cn("h-5 w-auto select-none", className)}
      draggable={false}
    />
  );
}
