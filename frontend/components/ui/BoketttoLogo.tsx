import Image from "next/image"

export function BokettoPinIcon({ className = "", size = 32 }: { className?: string; size?: number }) {
    return (
        <Image
            src="/bokettoicon.png"
            alt="Boketto"
            width={size}
            height={size}
            className={className}
            priority
        />
    )
}

export function BokettoWordmark({ className = "", height = 20 }: { className?: string; height?: number }) {
    return (
        <Image
            src="/bokettowordmark.png"
            alt="Boketto"
            width={height * 4}
            height={height}
            className={className}
            priority
        />
    )
}
