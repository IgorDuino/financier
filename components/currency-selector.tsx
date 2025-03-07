"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Currency = {
  code: string
  symbol: string
  name: string
}

const currencies: Currency[] = [
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
]

type CurrencySelectorProps = {
  onCurrencyChange: (currency: Currency) => void
}

export function CurrencySelector({ onCurrencyChange }: CurrencySelectorProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0])

  useEffect(() => {
    const savedCurrency = localStorage.getItem("selected-currency")
    if (savedCurrency) {
      const currency = currencies.find(c => c.code === savedCurrency)
      if (currency) {
        setSelectedCurrency(currency)
        onCurrencyChange(currency)
      }
    }
  }, [onCurrencyChange])

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency)
    localStorage.setItem("selected-currency", currency.code)
    onCurrencyChange(currency)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-24">
          {selectedCurrency.code} {selectedCurrency.symbol}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => handleCurrencyChange(currency)}
          >
            {currency.code} {currency.symbol} - {currency.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 