"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, RefreshCw, AlertCircle, CheckCircle2, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function InventoryPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [stockItems, setStockItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [sheetId, setSheetId] = useState("")
    const [sheetName, setSheetName] = useState("Sayfa1") // Default
    const [brandFilter, setBrandFilter] = useState<string>("all")
    const [editingCritical, setEditingCritical] = useState<number | null>(null)
    const [editValue, setEditValue] = useState("")

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
                    range: `${sheetName}!A2:H`,
                    brandName: sheetName // Pass sheet name as brand
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

    const handleDelete = async (id: number) => {
        if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;

        try {
            const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert("Ürün silindi");
                fetchInventory();
            } else {
                alert("Silme hatası");
            }
        } catch (e) {
            alert("Bağlantı hatası");
        }
    }

    const handleCriticalUpdate = async (id: number, newValue: string) => {
        const parsedValue = parseInt(newValue);
        if (isNaN(parsedValue) || parsedValue < 0) {
            alert("Geçerli bir sayı girin");
            return;
        }

        try {
            const res = await fetch(`/api/inventory/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ critical_stock_level: parsedValue })
            });
            if (res.ok) {
                setEditingCritical(null);
                fetchInventory();
            } else {
                alert("Güncelleme hatası");
            }
        } catch (e) {
            alert("Bağlantı hatası");
        }
    }

    // Get unique brands for filter
    const uniqueBrands = Array.from(new Set(stockItems.map(item => item.brand).filter(Boolean)));

    const filteredItems = stockItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.product_code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBrand = brandFilter === "all" || item.brand === brandFilter;
        return matchesSearch && matchesBrand;
    })

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
                    <div className="flex gap-2">
                        <Select value={brandFilter} onValueChange={setBrandFilter}>
                            <SelectTrigger className="w-[160px] bg-white">
                                <SelectValue placeholder="Marka Filtrele" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Markalar</SelectItem>
                                {uniqueBrands.map(brand => (
                                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                <TableHead className="w-[60px]">Sıra</TableHead>
                                <TableHead className="w-[120px]">Ürün Kodu</TableHead>
                                <TableHead>Ürün Tanımı</TableHead>
                                <TableHead>Marka</TableHead>
                                <TableHead>Ölçü</TableHead>
                                <TableHead className="text-right">Stok</TableHead>
                                <TableHead className="text-right">Kritik</TableHead>
                                <TableHead className="text-right">Fiyat</TableHead>
                                <TableHead className="text-center">Durum</TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center h-24 text-slate-500">
                                        Yükleniyor...
                                    </TableCell>
                                </TableRow>
                            ) : filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center h-24 text-slate-500">
                                        Ürün bulunamadı. "Google Sheet ile Eşitle" butonunu kullanarak veri çekin.
                                    </TableCell>
                                </TableRow>
                            ) : filteredItems.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="text-slate-500">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{item.product_code}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.brand}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell className="text-right font-bold text-slate-700">{item.stock_quantity}</TableCell>
                                    <TableCell className="text-right text-slate-500">
                                        {editingCritical === item.id ? (
                                            <Input
                                                type="number"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => handleCriticalUpdate(item.id, editValue)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleCriticalUpdate(item.id, editValue);
                                                    if (e.key === 'Escape') setEditingCritical(null);
                                                }}
                                                className="w-16 h-7 text-right"
                                                autoFocus
                                            />
                                        ) : (
                                            <span
                                                onClick={() => {
                                                    setEditingCritical(item.id);
                                                    setEditValue(item.critical_stock_level?.toString() || "5");
                                                }}
                                                className="cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
                                            >
                                                {item.critical_stock_level}
                                            </span>
                                        )}
                                    </TableCell>
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
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
