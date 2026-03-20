import type { Config } from "tailwindcss"

const config = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                    container: "hsl(var(--primary-container))",
                    fixed: "hsl(var(--primary-fixed))",
                    "fixed-dim": "hsl(var(--primary-fixed-dim))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                    container: "hsl(var(--secondary-container))",
                    fixed: "hsl(var(--secondary-fixed))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                /* Stitch M3 Surface Tiers */
                surface: {
                    DEFAULT: "hsl(var(--surface))",
                    dim: "hsl(var(--surface-dim))",
                    bright: "hsl(var(--surface-bright))",
                    "container-lowest": "hsl(var(--surface-container-lowest))",
                    "container-low": "hsl(var(--surface-container-low))",
                    container: "hsl(var(--surface-container))",
                    "container-high": "hsl(var(--surface-container-high))",
                    "container-highest": "hsl(var(--surface-container-highest))",
                },
                tertiary: {
                    DEFAULT: "hsl(var(--tertiary))",
                    container: "hsl(var(--tertiary-container))",
                    fixed: "hsl(var(--tertiary-fixed))",
                },
                outline: {
                    DEFAULT: "hsl(var(--outline))",
                    variant: "hsl(var(--border))",
                },
            },
            borderRadius: {
                "2xl": "1.5rem",
                xl: "1rem",
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            boxShadow: {
                ambient: "0 20px 40px rgba(24, 28, 27, 0.06)",
                "ambient-lg": "0 30px 60px rgba(24, 28, 27, 0.08)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fade-in": {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                "slide-up": {
                    from: { opacity: "0", transform: "translateY(8px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.3s ease-out",
                "slide-up": "slide-up 0.4s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
