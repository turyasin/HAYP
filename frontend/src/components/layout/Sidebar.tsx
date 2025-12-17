import Link from 'next/link';
import { Home, Users, Package, FileText, ShoppingCart, Receipt, Layers } from 'lucide-react';

const Sidebar = () => {
    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-orange-500 bg-clip-text text-transparent">
                    HAYP
                </h1>
                <p className="text-xs text-slate-400 mt-1">Has Yönetim Platformu</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <Link href="/inventory" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                    <Home size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link href="/companies" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                    <Users size={20} />
                    <span>Firmalar</span>
                </Link>
                <Link href="/products" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                    <Package size={20} />
                    <span>Ürün Listeleri</span>
                </Link>
                <Link href="/quotes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                    <FileText size={20} />
                    <span>Teklifler</span>
                </Link>
                <Link href="/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                    <ShoppingCart size={20} />
                    <span>Siparişler</span>
                </Link>
                <Link href="/invoices" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                    <Receipt size={20} />
                    <span>Faturalar</span>
                </Link>
                <Link href="/inventory" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                    <Layers size={20} />
                    <span>Stoklar</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        U
                    </div>
                    <div>
                        <p className="text-sm font-medium">Kullanıcı</p>
                        <p className="text-xs text-slate-400">Yönetici</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
