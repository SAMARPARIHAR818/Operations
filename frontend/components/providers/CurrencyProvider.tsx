"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'

type Currency = 'INR' | 'USD'

interface CurrencyContextType {
    currency: Currency;
    exchangeRate: number; // 1 USD = X INR
    setCurrency: (c: Currency) => void;
    formatAmount: (amountInInr: number, abbreviate?: boolean) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: 'INR',
    exchangeRate: 83.0,
    setCurrency: () => {},
    formatAmount: (amount) => `₹${amount.toLocaleString('en-IN')}`
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState<Currency>('INR')
    const [exchangeRate, setExchangeRate] = useState<number>(83.0)

    useEffect(() => {
        // Fetch live conversion rate from open API
        fetch('https://open.er-api.com/v6/latest/USD')
            .then(res => res.json())
            .then(data => {
                if (data && data.rates && data.rates.INR) {
                    setExchangeRate(data.rates.INR)
                }
            })
            .catch(err => console.error("Failed to fetch exchange rate", err))
    }, [])

    const formatAmount = (amountInInr: number, abbreviate = false) => {
        if (!amountInInr) return currency === 'INR' ? '₹0' : '$0.00'
        if (currency === 'INR') {
            if (abbreviate) {
                if (amountInInr >= 100000) return `₹${(amountInInr / 100000).toFixed(1)}L`
                if (amountInInr >= 1000) return `₹${(amountInInr / 1000).toFixed(0)}K`
            }
            return `₹${Math.round(amountInInr).toLocaleString('en-IN')}`
        } else {
            const inUsd = amountInInr / exchangeRate
            if (abbreviate) {
                if (inUsd >= 100000) return `$${(inUsd / 1000).toFixed(1)}k`
                if (inUsd >= 1000) return `$${(inUsd / 1000).toFixed(1)}k`
            }
            return `$${inUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
    }

    return (
        <CurrencyContext.Provider value={{ currency, exchangeRate, setCurrency, formatAmount }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export const useCurrency = () => useContext(CurrencyContext)
