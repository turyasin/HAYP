"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

interface UploadListDialogProps {
    supplierId: string;
    supplierName: string;
}

export function UploadListDialog({ supplierId, supplierName }: UploadListDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Upload size={14} />
                    Liste Yükle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ürün Listesi Yükle</DialogTitle>
                    <DialogDescription>
                        {supplierName} için güncel ürün listesini yükleyin.
                        Desteklenen formatlar: .xlsx, .pdf, .jpg, .png
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="file">Dosya Seç</Label>
                        <Input id="file" type="file" accept=".xlsx,.xls,.pdf,.jpg,.jpeg,.png" />
                    </div>
                    <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                        ⚠️ Yükleme yapıldıktan sonra sistem dosyayı otomatik olarak işleyecek ve ürünleri güncelleyecektir. Bu işlem dosya boyutuna göre birkaç dakika sürebilir.
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Yükle ve İşle</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
