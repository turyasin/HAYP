"use client"

import Link from 'next/link';
import { useState } from 'react';
import { FileText, Users, ShoppingCart, Truck, Layers, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Toggle Login Simulation
  const handleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  const cards = [
    {
      title: "Teklif Hazırla",
      description: "Yeni bir satış teklifi oluşturun, maliyetlendirin ve iletin.",
      icon: FileText,
      href: "/quotes/create", // Changed back to href
      color: "text-blue-400",
      bgHover: "hover:bg-slate-800",
      border: "border-slate-700",
      isActive: isLoggedIn
    },
    {
      title: isLoggedIn ? "Kullanıcı Çıkışı" : "Kullanıcı Girişi",
      description: isLoggedIn ? "Oturumunuzu kapatın." : "Platforma erişmek için giriş yapın.",
      icon: isLoggedIn ? LogOut : LogIn,
      action: handleLogin,
      color: "text-blue-500",
      bgHover: "hover:bg-slate-800",
      border: "border-blue-500/50",
      isActive: true
    },
    {
      title: "Müşteriler",
      description: "Müşteri veritabanını yönetin, yeni cari kartlar açın.",
      icon: Users,
      href: "/companies",
      color: "text-green-400",
      bgHover: "hover:bg-slate-800",
      border: "border-slate-700",
      isActive: isLoggedIn
    },
    {
      title: "Siparişler",
      description: "Onaylanan siparişleri takip edin ve teslimatları yönetin.",
      icon: ShoppingCart,
      href: "/orders",
      color: "text-orange-400",
      bgHover: "hover:bg-slate-800",
      border: "border-slate-700",
      isActive: isLoggedIn
    },
    {
      title: "Tedarikçiler",
      description: "Tedarikçi listelerini yükleyin ve entegrasyonları yönetin.",
      icon: Truck,
      href: "/companies",
      color: "text-purple-400",
      bgHover: "hover:bg-slate-800",
      border: "border-slate-700",
      isActive: isLoggedIn
    },
    {
      title: "Stok Yönetimi",
      description: "Kritik stok seviyelerini izleyin ve otomatik sipariş oluşturun.",
      icon: Layers,
      href: "/inventory",
      color: "text-red-400",
      bgHover: "hover:bg-slate-800",
      border: "border-slate-700",
      isActive: isLoggedIn
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-12 bg-[#1e293b] text-white">
      <div className="text-center space-y-4">
        <h1 className="font-extrabold tracking-tight pb-2 flex flex-col items-center gap-2">
          <span className="text-4xl md:text-6xl text-white">KAYALAR HAS</span>
          <span className="text-3xl md:text-5xl bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
            Yönetim Platformu
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto pt-4">
          Endüstriyel mutfak süreçlerinizi tek noktadan yönetin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl px-4">
        {cards.map((card, index) => {
          const Content = (
            <div className={`
              relative flex flex-col items-center text-center p-8 h-full
              bg-slate-900/50 rounded-2xl border ${card.border} shadow-lg
              transition-all duration-300 ease-in-out
              ${card.isActive ? `cursor-pointer ${card.bgHover} group-hover:-translate-y-2 group-hover:shadow-2xl` : 'opacity-40 cursor-not-allowed grayscale'}
            `}>
              <div className={`p-4 rounded-full bg-slate-800 mb-6 transition-transform ${card.isActive ? 'group-hover:scale-110' : ''} ${card.color}`}>
                <card.icon size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">{card.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{card.description}</p>

              {card.isActive && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          );

          if (card.action) {
            return (
              <div key={index} onClick={card.action} className="group h-full">
                {Content}
              </div>
            )
          }

          return (
            <Link key={index} href={card.isActive ? card.href! : '#'} className={`group h-full ${!card.isActive && 'pointer-events-none'}`}>
              {Content}
            </Link>
          )
        })}
      </div>
    </div>
  );
}
