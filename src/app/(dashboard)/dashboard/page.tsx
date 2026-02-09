import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Users, Calendar, TrendingUp } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Calls (AI)</CardTitle>
                        <Phone className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,350</div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            +180.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
                        <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+573</div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            +201 since last hour
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                        <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">128</div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            +19% from last week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center">
                                        <Phone className="h-4 w-4 text-[hsl(var(--primary))]" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Inbound Call (AI Handled)</p>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                            +1 (555) 123-456{i}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm">Now</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Pipeline Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Lead Qualified</span>
                                    <span className="font-bold">45%</span>
                                </div>
                                <div className="h-2 rounded-full bg-[hsl(var(--secondary))]">
                                    <div className="h-full w-[45%] rounded-full bg-[hsl(var(--primary))]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Appointment Booked</span>
                                    <span className="font-bold">32%</span>
                                </div>
                                <div className="h-2 rounded-full bg-[hsl(var(--secondary))]">
                                    <div className="h-full w-[32%] rounded-full bg-[hsl(var(--primary))]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Proposal Sent</span>
                                    <span className="font-bold">12%</span>
                                </div>
                                <div className="h-2 rounded-full bg-[hsl(var(--secondary))]">
                                    <div className="h-full w-[12%] rounded-full bg-[hsl(var(--primary))]" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
