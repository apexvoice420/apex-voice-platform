import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Shield, Smartphone } from "lucide-react";

export default function Home() {
    return (
        <main className="h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] p-4">
            <div className="max-w-md w-full text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: 'hsl(var(--foreground))' }}>
                    Apex Voice Platform
                </h1>
                <p className="text-[hsl(var(--muted-foreground))]">
                    The proprietary white-label solution for next-gen agencies.
                </p>
            </div>

            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Sign in to your account</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="input"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Password</label>
                        <input
                            type="password"
                            className="input"
                        />
                    </div>
                    <Button className="w-full">
                        Sign In
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[hsl(var(--border))]" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[hsl(var(--card))] px-2 text-[hsl(var(--muted-foreground))]">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full">
                        SSO Login
                    </Button>
                </CardContent>
            </Card>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl">
                <div className="flex flex-col items-center p-4">
                    <div className="p-3 rounded-full bg-[hsl(var(--secondary))] mb-4">
                        <Smartphone className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <h3 className="font-semibold mb-2">Native Voice AI</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Integrated telephony with zero latency throughout.
                    </p>
                </div>
                <div className="flex flex-col items-center p-4">
                    <div className="p-3 rounded-full bg-[hsl(var(--secondary))] mb-4">
                        <Shield className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <h3 className="font-semibold mb-2">White-Label Ready</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Your brand, your domain, your platform.
                    </p>
                </div>
                <div className="flex flex-col items-center p-4">
                    <div className="p-3 rounded-full bg-[hsl(var(--secondary))] mb-4">
                        <Send className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <h3 className="font-semibold mb-2">Unified Messaging</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        SMS, Email, and Voice in one timeline.
                    </p>
                </div>
            </div>
        </main>
    );
}
