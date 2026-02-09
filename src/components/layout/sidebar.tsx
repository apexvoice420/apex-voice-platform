'use client';

import { LayoutDashboard, Users, MessageSquare, Phone, Calendar, GitBranch, Settings, LogOut, Bot, Workflow } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { auth } from '@/lib/firebase';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Contacts', href: '/contacts' },
    { icon: MessageSquare, label: 'Conversations', href: '/conversations' },
    { icon: GitBranch, label: 'Pipelines', href: '/pipelines' },
    { icon: Bot, label: 'Agents', href: '/agents' },
    { icon: Workflow, label: 'Workflows', href: '/workflows' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <aside className="w-[var(--sidebar-width)] border-r bg-[hsl(var(--card))] h-screen flex flex-col fixed left-0 top-0">
            <div className="h-[var(--header-height)] flex items-center px-6 border-b">
                <span className="font-bold text-lg text-[hsl(var(--primary))]">Apex Voice</span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"
                                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-[hsl(var(--destructive))] hover:bg-[hsl(var(--secondary))] rounded-md transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
