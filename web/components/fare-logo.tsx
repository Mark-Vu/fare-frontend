import Image from "next/image"
import { cn } from "cn"

type FareLogoProps = {
  className?: string
  priority?: boolean
}

export function FareLogo({ className, priority = false }: FareLogoProps) {
  return (
    <Image
      src="/images/fareLogo.png"
      alt="Fare"
      width={789}
      height={553}
      priority={priority}
      className={cn("w-auto", className)}
    />
  )
}
