import { Sidebar } from "@/components/layout/sidebar";
import { AuthGuard } from "@/components/providers/auth-guard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-[hsl(var(--background))]">
                <Sidebar />
                <div className="pl-[var(--sidebar-width)]">
                    <header className="h-[var(--header-height)] border-b bg-[hsl(var(--card))] flex items-center justify-between px-8 sticky top-0 z-10">
                        <h2 className="font-semibold text-lg">Dashboard</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">
                                Demo Client (White-Label)
                            </span>
                            <div className="h-8 w-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))] text-xs font-bold">
                                DC
                            </div>
                        </div>
                    </header>
                    <main className="p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
