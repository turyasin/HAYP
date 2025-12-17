"use client"

import React, { useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export interface QuoteItem {
    id: string
    productCode: string
    productName: string
    supplierName: string
    unit: string // Birim (Adet, Kg, Mt)
    dimensions: string // [NEW] Ölçü (100x200 vb)
    quantity: number
    currency: 'TRY' | 'USD' | 'EUR' // [NEW]
    supplierListPrice: number // Tedarikçi Liste Fiyatı
    supplierDiscount: number // Tedarikçi İskontosu (%)
    markup: number // Kar Marjı (%)
}

interface CostTableProps {
    items: QuoteItem[]
    setItems: React.Dispatch<React.SetStateAction<QuoteItem[]>>
    rates: { USD: number, EUR: number, TRY: number } // [NEW]
}

export function CostTable({ items, setItems, rates }: CostTableProps) { // [NEW]

    // recalculate values when inputs change
    const updateItem = (id: string, field: keyof QuoteItem, value: any) => { // Changed value type to any to support string dimensions
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value }
            }
            return item
        }))
    }

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id))
    }

    return (
        <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50">
                        <TableHead className="w-[50px]">Sıra</TableHead>
                        <TableHead className="min-w-[100px]">Tedarikçi</TableHead>
                        <TableHead className="min-w-[100px]">Ürün Kodu</TableHead>
                        <TableHead className="min-w-[200px]">Malzeme Tanımı</TableHead>
                        <TableHead className="min-w-[100px]">Ölçü</TableHead> {/* [NEW] Real Dimensions */}
                        <TableHead className="w-[80px]">Miktar</TableHead>
                        <TableHead className="w-[80px]">Birim</TableHead>
                        <TableHead className="w-[80px] font-bold text-slate-800">Döviz</TableHead> {/* [NEW] Bold */}
                        <TableHead className="min-w-[120px] bg-blue-50/50">Liste Fiyatı</TableHead>
                        <TableHead className="min-w-[120px] bg-blue-50/50">İskonto (%)</TableHead>
                        <TableHead className="min-w-[120px] bg-blue-50">Birim Maliyet (TL)</TableHead>
                        <TableHead className="min-w-[120px] bg-blue-100/50 font-semibold">Top. Maliyet (TL)</TableHead>
                        <TableHead className="min-w-[120px] bg-orange-50 text-orange-700 font-bold">Kar Marjı (%)</TableHead>
                        <TableHead className="min-w-[120px] bg-green-50 font-bold">Birim Fiyat (TL)</TableHead>
                        <TableHead className="min-w-[120px] bg-green-100/50 font-bold">Top. Fiyat (TL)</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={13} className="h-24 text-center text-slate-500">
                                Henüz ürün eklenmedi. Ürün seçerek başlayın.
                            </TableCell>
                        </TableRow>
                    ) : items.map((item, index) => {
                        // Calculations
                        // Get rate based on item currency (SAFE ACCESS)
                        const rate = rates && rates[item.currency] ? rates[item.currency] : 1;

                        // Calculate base cost in TRY
                        const basePriceInTry = item.supplierListPrice * rate;

                        const costPrice = basePriceInTry * (1 - item.supplierDiscount / 100);
                        const totalCost = costPrice * item.quantity;
                        const unitPrice = costPrice * (1 + item.markup / 100);
                        const totalPrice = unitPrice * item.quantity;

                        return (
                            <TableRow key={item.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="text-xs font-semibold text-purple-700">{item.supplierName}</TableCell>
                                <TableCell className="font-medium text-xs">{item.productCode}</TableCell>
                                <TableCell className="text-xs">{item.productName}</TableCell>
                                <TableCell className="text-xs text-slate-500">{item.dimensions}</TableCell> {/* [NEW] */}
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                        className="h-8 w-16"
                                    />
                                </TableCell>
                                <TableCell className="text-xs text-slate-500">{item.unit}</TableCell>
                                <TableCell className="w-[80px]">
                                    <select
                                        className="h-8 w-16 text-xs bg-slate-50 border border-slate-200 rounded px-1 font-bold text-slate-800" // Added font-bold
                                        value={item.currency}
                                        onChange={(e) => updateItem(item.id, 'currency', e.target.value)}
                                    >
                                        <option value="TRY">TL</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </TableCell>
                                {/* Cost Side */}
                                <TableCell className="text-xs text-slate-500 bg-blue-50/30">
                                    {item.supplierListPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="bg-blue-50/30">
                                    <Input
                                        type="number"
                                        value={item.supplierDiscount}
                                        onChange={(e) => updateItem(item.id, 'supplierDiscount', Number(e.target.value))}
                                        className="h-8 w-16 bg-white"
                                    />
                                </TableCell>
                                <TableCell className="text-xs font-medium bg-blue-50/50">
                                    {/* Shows converted cost if currency is not TRY */}
                                    {item.currency !== 'TRY' && (
                                        <div className="text-[10px] text-slate-400">
                                            (x {rates[item.currency]?.toFixed(2)})
                                        </div>
                                    )}
                                    {costPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-xs font-bold bg-blue-100/30">
                                    {totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                {/* Profit Side */}
                                <TableCell className="bg-orange-50/50">
                                    <Input
                                        type="number"
                                        value={item.markup}
                                        onChange={(e) => updateItem(item.id, 'markup', Number(e.target.value))}
                                        className="h-8 w-16 border-orange-200 focus-visible:ring-orange-500 text-orange-700 font-bold bg-white"
                                    />
                                </TableCell>
                                <TableCell className="text-sm font-bold text-green-700 bg-green-50/50">
                                    {unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-sm font-bold text-green-800 bg-green-100/30">
                                    {totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 size={16} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
