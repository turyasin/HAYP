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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function CompanyDialog({ type }: { type: 'customer' | 'supplier' }) {
    const title = type === 'customer' ? 'Yeni Müşteri Ekle' : 'Yeni Tedarikçi Ekle';

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default">+ {title}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Firma bilgilerini aşağıya giriniz. Kaydettikten sonra işlemlere başlayabilirsiniz.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Firma Adı
                        </Label>
                        <Input id="name" placeholder="ABC Mutfak A.Ş." className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="person" className="text-right">
                            Yetkili
                        </Label>
                        <Input id="person" placeholder="Ahmet Yılmaz" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                            Telefon
                        </Label>
                        <Input id="phone" placeholder="0532..." className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            E-posta
                        </Label>
                        <Input id="email" placeholder="iletisim@abc.com" className="col-span-3" />
                    </div>

                    {type === 'supplier' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="discount" className="text-right">
                                İndirim (%)
                            </Label>
                            <Input id="discount" type="number" placeholder="20" className="col-span-3" />
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                            Notlar
                        </Label>
                        <Textarea id="notes" placeholder="Özel notlar..." className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Kaydet</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
