"use client"

import React, { useState, useEffect } from 'react'
import { CostTable, QuoteItem } from "@/components/quotes/CostTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, FileDown, Plus } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function QuoteCreatePage() {
    const [generalDiscountRate, setGeneralDiscountRate] = useState<number>(0)
    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        taxId: "",
        contactPerson: "",
        email: "",
        address: ""
    })

    // Add default date +15 days for validity
    const [validityDate, setValidityDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() + 15);
        return d.toISOString().split('T')[0];
    });

    const [rates, setRates] = useState<{ USD: number, EUR: number, TRY: number }>({ USD: 34.50, EUR: 37.50, TRY: 1 }) // Fallback default

    useEffect(() => {
        // Fetch live rates
        fetch('http://localhost:3001/api/exchange-rates')
            .then(res => res.json())
            .then(data => {
                if (data.USD) setRates(data)
            })
            .catch(err => console.error("Rate fetch error", err))
    }, [])

    const [items, setItems] = useState<QuoteItem[]>([
        {
            id: '1',
            supplierName: 'Kayalar Mutfak',
            productCode: 'MOCK-001',
            productName: 'Endüstriyel Bulaşık Makinesi 1000 Tabak',
            unit: 'Adet',
            dimensions: '80x80x150',
            quantity: 1,
            currency: 'TRY',
            supplierListPrice: 50000,
            supplierDiscount: 40,
            markup: 20
        },
        {
            id: '2',
            supplierName: 'İthal Ürünler Ltd',
            productCode: 'IMP-002',
            productName: 'Rational Fırın',
            unit: 'Adet',
            dimensions: '100x100x100',
            quantity: 1,
            currency: 'EUR',
            supplierListPrice: 10000, // 10.000 EUR
            supplierDiscount: 25,
            markup: 15
        }
    ])

    // Calculation Helpers
    const calculateTotals = () => {
        let cost = 0;
        let price = 0;

        items.forEach(item => {
            const rate = rates[item.currency] || 1;
            const baseCostTry = item.supplierListPrice * rate * (1 - item.supplierDiscount / 100);
            const unitPrice = baseCostTry * (1 + item.markup / 100);
            const totalPrice = unitPrice * item.quantity;

            cost += baseCostTry * item.quantity;
            price += totalPrice;
        })

        return { cost, price }
    }

    const { cost: totalCost, price: subTotalPrice } = calculateTotals();
    const generalDiscountAmount = subTotalPrice * (generalDiscountRate / 100);
    const discountedTotal = subTotalPrice - generalDiscountAmount;
    const vatRate = 0.20; // 20% KDV
    const vatAmount = discountedTotal * vatRate;
    const finalTotalPrice = discountedTotal + vatAmount;

    const totalProfit = discountedTotal - totalCost;
    const averageMargin = discountedTotal > 0 ? (totalProfit / totalCost) * 100 : 0;


    const generatePDF = async () => {
        // use compress: true to reduce file size
        const doc = new jsPDF({ compress: true });

        const fileToBase64 = (url: string): Promise<string> => {
            return new Promise((resolve, reject) => {
                fetch(url).then(r => r.blob()).then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(blob);
                }).catch(reject);
            });
        };

        const loadImage = (url: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = url;
                img.onload = () => resolve(img);
                img.onerror = reject;
            });
        };

        try {
            // 1. Font Injection
            try {
                const fontBase64 = await fileToBase64('/fonts/Roboto-Regular.ttf');
                doc.addFileToVFS("Roboto-Regular.ttf", fontBase64);
                doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
                doc.addFont("Roboto-Regular.ttf", "Roboto", "bold"); // [FIX] Map Regular to Bold to prevent fallback garbage
                doc.setFont("Roboto"); // Set as default         } catch (e) {
            } catch (e) {
                console.warn("Font load failed, falling back to courier", e);
                doc.setFont("Courier"); // Safer fallback for chars than Helvetica
            }

            // 2. Logo & Header
            try {
                const logoImg = await loadImage('/logo.png');
                const ratio = logoImg.width / logoImg.height;
                // Smaller logo: height 15mm
                doc.addImage(logoImg, 'PNG', 14, 10, 15 * ratio, 15);
            } catch (e) {
                doc.setFontSize(22);
                doc.setTextColor(26, 68, 115);
                doc.text("KAYALAR HAS", 14, 20);
            }

            // Info Block (Top Right)
            doc.setFontSize(9);
            doc.setTextColor(80);
            const today = new Date().toLocaleDateString('tr-TR');
            // Parse validity date properly
            const [y, m, d] = validityDate.split('-');
            const formattedValidity = `${d}.${m}.${y}`;

            doc.text(`Teklif Tarihi: ${today}`, 195, 15, { align: 'right' });
            doc.text(`Geçerlilik Tarihi: ${formattedValidity}`, 195, 20, { align: 'right' });
            doc.text(`Teklif No: HAYP-2025-12-0001`, 195, 25, { align: 'right' });

            // 3. Customer Info Section
            doc.setDrawColor(200);
            doc.line(14, 32, 195, 32);

            doc.setFontSize(10);
            doc.setTextColor(40);
            doc.setFont("Roboto", "bold");
            doc.text("Müşteri Bilgileri:", 14, 40);

            doc.setFont("Roboto", "normal");
            doc.setFontSize(9);
            let yPos = 45;
            if (customerInfo.name) { doc.text(customerInfo.name, 14, yPos); yPos += 5; }
            if (customerInfo.contactPerson) { doc.text(`İlgili: ${customerInfo.contactPerson}`, 14, yPos); yPos += 5; }
            if (customerInfo.email) { doc.text(`E-posta: ${customerInfo.email}`, 14, yPos); yPos += 5; }
            if (customerInfo.address) {
                const splitAddress = doc.splitTextToSize(customerInfo.address, 100);
                doc.text(splitAddress, 14, yPos);
                yPos += (splitAddress.length * 4);
            }

            doc.text("İstemiş olduğunuz ürünlere ait fiyat teklifimiz aşağıda bilgilerinize sunulmuştur.", 14, yPos + 5);

            // 4. Table
            const tableBody = items.map((item, index) => {
                const rate = rates[item.currency] || 1;
                const baseCostTry = item.supplierListPrice * rate * (1 - item.supplierDiscount / 100);
                const unitPrice = baseCostTry * (1 + item.markup / 100);
                const totalPrice = unitPrice * item.quantity;

                return [
                    index + 1,
                    item.productCode,
                    item.productName,
                    item.quantity,
                    item.unit,
                    unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TL",
                    totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TL"
                ]
            })

            const startYTable = yPos + 12;

            autoTable(doc, {
                head: [['#', 'Ürün Kodu', 'Ürün Adı', 'Miktar', 'Birim', 'Birim Fiyat', 'Toplam Fiyat']],
                body: tableBody,
                startY: startYTable,
                theme: 'grid', // Switch to grid for better defined borders
                styles: {
                    font: "Roboto",
                    fontSize: 9,
                    cellPadding: 2, // [FIX] Reduced from 6 back to 2 to prevent wrapping
                    lineColor: [230, 230, 230], // Softer gray lines
                    lineWidth: 0.1,
                    textColor: 40,
                    valign: 'middle'
                },
                headStyles: {
                    fillColor: [240, 240, 230], // Beige
                    textColor: 0, // Black
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle',
                    lineWidth: 0.1,
                    lineColor: [200, 200, 200]
                },
                columnStyles: {
                    0: { cellWidth: 8, halign: 'center' }, // Reduced
                    1: { cellWidth: 25 }, // Reduced
                    // 2 (Name) is auto
                    3: { cellWidth: 15, halign: 'center' }, // Optimized
                    4: { cellWidth: 15, halign: 'center' }, // Optimized
                    5: { cellWidth: 32, halign: 'right' }, // Increased for price
                    6: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }, // Increased for price
                },
                alternateRowStyles: {
                    fillColor: [249, 250, 251] // Very light gray (Slate 50)
                },
                margin: { left: 14, right: 14 }
            })

            // 5. Totals
            const finalY = (doc as any).lastAutoTable.finalY + 10;
            const rightEdge = 195;

            // Background box for totals
            doc.setFillColor(245, 247, 250);
            doc.rect(120, finalY - 5, 80, 35, 'F');

            const printTotalLine = (label: string, value: string, y: number, isBold: boolean = false, color: [number, number, number] = [80, 80, 80]) => {
                doc.setFont("Roboto", isBold ? "bold" : "normal");
                doc.setFontSize(isBold ? 11 : 9);
                doc.setTextColor(...color);
                doc.text(label, 125, y);
                doc.text(value, rightEdge - 5, y, { align: 'right' });
            }

            let currentY = finalY;

            printTotalLine("Ara Toplam:", `${subTotalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, currentY);
            currentY += 5;

            if (generalDiscountAmount > 0) {
                printTotalLine(`İskonto (%${generalDiscountRate}):`, `-${generalDiscountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, currentY, false, [200, 50, 50]);
                currentY += 5;
            }

            printTotalLine("KDV (%20):", `${vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, currentY);
            currentY += 7;

            // Final Total
            doc.setDrawColor(200);
            doc.line(125, currentY - 2, 190, currentY - 2);
            printTotalLine("GENEL TOPLAM:", `${finalTotalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, currentY + 3, true, [0, 0, 0]);


            // 6. Footer Notes (Bottom of Page)
            const pageHeight = doc.internal.pageSize.height;
            doc.setFont("Roboto", "normal");
            doc.setFontSize(7);
            doc.setTextColor(150);

            const notes = [
                "* Bu teklif belirtilen geçerlilik tarihine kadar opsiyonludur.",
                "* Teslimat süresi stok durumuna göre teyit edilecektir.",
                "* Fiyatlarımıza KDV dahil değildir (yukarıda ayrıca belirtilmiştir).",
                "* Ödeme şekli siparişle birlikte %50 peşin, bakiye mal tesliminde peşindir."
            ];

            let noteY = pageHeight - 30;
            notes.forEach((note) => {
                doc.text(note, 14, noteY);
                noteY += 4;
            });

            doc.save("Teklif_KayalarHas.pdf");

        } catch (err) {
            console.error("PDF Fail:", err);
            alert("PDF hatası: Lütfen yazı tipi dosyalarının yüklendiğinden emin olun.");
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Yeni Teklif Oluştur</h2>
                    <p className="text-slate-500">Müşteri seçin, ürünleri ekleyin ve fiyatlandırın.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={generatePDF}>
                        <FileDown size={16} /> Taslak İndir
                    </Button>
                    <Button className="gap-2">
                        <Save size={16} /> Kaydet
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <Card className="col-span-3">
                    <CardHeader className="pb-2 pt-3">
                        <CardTitle className="text-base font-bold">Teklif Detayları</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Müşteri Firma Ünvanı</Label>
                                <Input
                                    placeholder="Örn: ABC İnşaat A.Ş."
                                    className="h-8 text-xs"
                                    value={customerInfo.name}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">İlgili Kişi</Label>
                                <Input
                                    placeholder="Ad Soyad"
                                    className="h-8 text-xs"
                                    value={customerInfo.contactPerson}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, contactPerson: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">E-Posta</Label>
                                <Input
                                    placeholder="email@domain.com"
                                    className="h-8 text-xs"
                                    value={customerInfo.email}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Geçerlilik Tarihi</Label>
                                <Input
                                    type="date"
                                    className="h-8 text-xs"
                                    value={validityDate}
                                    onChange={(e) => setValidityDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Adres</Label>
                            <Textarea
                                placeholder="Fatura ve sevk adresi..."
                                className="h-16 text-xs resize-none"
                                value={customerInfo.address}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2 bg-slate-900 text-white border-slate-800 shadow-lg">
                    <CardHeader className="pb-1 pt-3 px-4">
                        <div className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-slate-100">Özet</CardTitle>
                            <div className="flex gap-2 text-[10px] text-slate-400">
                                <span>USD: {rates.USD}</span>
                                <span>EUR: {rates.EUR}</span>
                            </div>
                        </div>
                    </CardHeader>

                    <div className="px-4">
                        <div className="border-b-2 border-yellow-500 opacity-80" />
                    </div>

                    <CardContent className="space-y-1.5 pt-2 px-4 pb-3">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                            <span>Ara Toplam:</span>
                            <span>{subTotalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                        </div>

                        {generalDiscountAmount > 0 && (
                            <div className="flex justify-between items-center text-xs text-red-400">
                                <span>İndirim:</span>
                                <span>-{generalDiscountAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center py-1 border-t border-dashed border-slate-700">
                            <span className="text-yellow-400 font-medium text-xs">Genel İndirim (%):</span>
                            <Input
                                type="number"
                                value={generalDiscountRate}
                                onChange={(e) => setGeneralDiscountRate(Number(e.target.value))}
                                className="w-16 h-6 text-right bg-slate-800 border-slate-600 text-white text-xs font-bold"
                            />
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-400">
                            <span>KDV (%20):</span>
                            <span>{vatAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                        </div>

                        <div className="border-t border-slate-700 pt-1.5 mt-1">
                            <div className="flex justify-between items-center text-lg font-bold text-white">
                                <span>GENEL TOPLAM:</span>
                                <span>{finalTotalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1.5">
                            <div className={`p-1 rounded border ${totalProfit < 0 ? 'bg-red-900/30 border-red-900/50' : 'bg-green-900/30 border-green-900/50'}`}>
                                <div className={`text-[10px] ${totalProfit < 0 ? 'text-red-400' : 'text-green-400'}`}>Net Kar</div>
                                <div className={`font-bold text-sm ${totalProfit < 0 ? 'text-red-300' : 'text-green-300'}`}>{totalProfit.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
                            </div>
                            <div className={`p-1 rounded border ${averageMargin < 0 ? 'bg-red-900/30 border-red-900/50' : 'bg-orange-900/30 border-orange-900/50'}`}>
                                <div className={`text-[10px] ${averageMargin < 0 ? 'text-red-400' : 'text-orange-400'}`}>Kar Marjı</div>
                                <div className={`font-bold text-sm ${averageMargin < 0 ? 'text-red-300' : 'text-orange-300'}`}>%{averageMargin.toFixed(1)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Ürünler ve Maliyet Analizi</h3>
                    <Button size="sm" variant="secondary" className="gap-2">
                        <Plus size={16} /> Ürün Ekle
                    </Button>
                </div>

                <CostTable items={items} setItems={setItems} rates={rates} />
            </div>
        </div>
    )
}
