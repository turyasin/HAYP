
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { columns, Customer } from "./columns"
import { CompanyDialog } from "@/components/companies/CompanyDialog"

async function getData(): Promise<Customer[]> {
    // Mock data for now, will replace with API call
    return [
        {
            id: "728ed52f",
            name: "Kayalar Mutfak",
            contact_person: "Ahmet Kaya",
            email: "m@example.com",
            phone: "0555 123 45 67",
            status: "active",
            tax_number: "1234567890"
        },
        {
            id: "728ed52e",
            name: "Otel Ekipmanları Ltd.",
            contact_person: "Mehmet Yılmaz",
            email: "mehmet@otel.com",
            phone: "0212 123 45 67",
            status: "active",
            tax_number: "987654321"
        },
    ]
}

export default async function CompaniesPage() {
    const data = await getData()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Firmalar</h2>
                    <p className="text-slate-500">Müşteri ve Tedarikçi Yönetimi</p>
                </div>
            </div>

            <Tabs defaultValue="customers" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="customers">Müşteriler</TabsTrigger>
                    <TabsTrigger value="suppliers">Tedarikçiler</TabsTrigger>
                    <TabsTrigger value="senders">Gönderen Firmalar</TabsTrigger>
                </TabsList>
                <TabsContent value="customers" className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                        <div className="space-y-1">
                            <h3 className="font-semibold">Müşteri Listesi</h3>
                            <p className="text-sm text-slate-500">Sistemde kayıtlı müşteriler</p>
                        </div>
                        <CompanyDialog type="customer" />
                    </div>
                    <DataTable columns={columns} data={data} searchKey="name" />
                </TabsContent>
                <TabsContent value="suppliers">
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm mb-4">
                        <div className="space-y-1">
                            <h3 className="font-semibold">Tedarikçi Listesi</h3>
                            <p className="text-sm text-slate-500">Sistemde kayıtlı tedarikçiler</p>
                        </div>
                        <CompanyDialog type="supplier" />
                    </div>
                    <p className="text-sm text-slate-500">Tedarikçi listesi buraya gelecek (aynı yapı kullanılabilir).</p>
                </TabsContent>
            </Tabs>
        </div>
    );
}
