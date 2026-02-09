import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, ImgHTMLAttributes } from "react";

export const Avatar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={clsx("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
));
Avatar.displayName = "Avatar";

export const AvatarImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(({ className, ...props }, ref) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} className={clsx("aspect-square h-full w-full", className)} {...props} alt="Avatar" />
));
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={clsx("flex h-full w-full items-center justify-center rounded-full bg-[hsl(var(--muted))]", className)} {...props} />
));
AvatarFallback.displayName = "AvatarFallback";
