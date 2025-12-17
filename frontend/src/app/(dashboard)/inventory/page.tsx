"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"

export default function InventoryPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [stockItems, setStockItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [sheetId, setSheetId] = useState("")
    const [sheetName, setSheetName] = useState("Sayfa1") // Default

    const fetchInventory = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/inventory');
            if (res.ok) {
                const data = await res.json();
                setStockItems(data);
            } else {
                console.error("Failed to fetch inventory");
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInventory()
    }, [])

    const handleSync = async () => {
        setSyncing(true)
        try {
            const res = await fetch('/api/inventory/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    spreadsheetId: sheetId || "12345",
                    range: `${sheetName}!A2:H` // Construct range from user input
                })
            });
            if (res.ok) {
                const result = await res.json();
                alert(`Senkronizasyon Başarılı: ${result.message}`);
                fetchInventory();
            } else {
                const err = await res.json();
                alert(`Hata: ${err.details || "Bilinmeyen hata"}`);
            }
        } catch (e) {
            alert("Bağlantı hatası.");
        } finally {
            setSyncing(false);
        }
    }

    const filteredItems = stockItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-slate-50/50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-bold text-2xl text-slate-900">Stok Yönetimi</h1>
                    <p className="text-slate-500">
                        Ürünler ve stok durumlarını Google Sheets ile senkronize edin.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Sayfa Adı (Örn: Kayalar)"
                        value={sheetName}
                        onChange={e => setSheetName(e.target.value)}
                        className="w-[180px] bg-white"
                    />
                    <Input
                        placeholder="Google Sheet ID"
                        value={sheetId}
                        onChange={e => setSheetId(e.target.value)}
                        className="w-[180px] bg-white"
                    />
                    <Button onClick={handleSync} disabled={syncing}>
                        {syncing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        {syncing ? 'Senkronize Ediliyor...' : 'Google Sheet ile Eşitle'}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-base font-medium">Stok Listesi</CardTitle>
                    <div className="relative w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            type="search"
                            placeholder="Ürün adı veya kodu ara..."
                            className="pl-9 bg-slate-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                <TableHead className="w-[100px]">Ürün Kodu</TableHead>
                                <TableHead>Ürün Adı</TableHead>
                                <TableHead>Marka</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead className="text-right">Stok</TableHead>
                                <TableHead className="text-right">Kritik</TableHead>
                                <TableHead className="text-right">Fiyat</TableHead>
                                <TableHead className="text-center">Durum</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24 text-slate-500">
                                        Yükleniyor...
                                    </TableCell>
                                </TableRow>
                            ) : filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24 text-slate-500">
                                        Ürün bulunamadı. "Google Sheet ile Eşitle" butonunu kullanarak veri çekin.
                                    </TableCell>
                                </TableRow>
                            ) : filteredItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.product_code}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.brand}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell className="text-right font-bold text-slate-700">{item.stock_quantity}</TableCell>
                                    <TableCell className="text-right text-slate-500">{item.critical_stock_level}</TableCell>
                                    <TableCell className="text-right">
                                        {item.buying_price?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {item.currency}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {item.stock_quantity <= item.critical_stock_level ? (
                                            <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
                                                Kritik
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Yeterli
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
