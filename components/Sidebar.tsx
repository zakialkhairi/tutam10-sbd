'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, PlusCircle, CalendarPlus } from 'lucide-react';
import Image from 'next/image';

const navItems = [
  {
    name: 'Create Task',
    href: '/',
    icon: <CalendarPlus className="w-6 h-6" />,
  },
  {
    name: 'Collection',
    href: '/collection',
    icon: <LayoutGrid className="w-6 h-6" />,
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen border-r border-border bg-background flex flex-col p-6 fixed left-0 top-0 z-40">
      <div className="flex items-center gap-3 mb-12">
        <Image src="/images/logo.png" alt="Schedulium" width={40} height={40} className="object-contain" />
        <h1 className="text-xl font-header font-bold tracking-tight">Schedulium</h1>
      </div>

      <nav className="flex flex-col gap-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group",
                isActive
                  ? "bg-foreground text-background scale-105 shadow-md"
                  : "hover:bg-foreground/5"
              )}
            >
              <div className={cn(
                "w-10 h-10 flex items-center justify-center rounded-lg transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-110"
              )}>
                {typeof item.icon === 'string' ? (
                  <Image src={item.icon} alt={item.name} width={24} height={24} />
                ) : (
                  item.icon
                )}
              </div>
              <span className="font-bold tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 rounded-2xl bg-foreground/5 border border-border">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 mb-1">Status</p>
        <p className="text-sm font-bold">Local Sync Active</p>
      </div>
    </div>
  );
};
