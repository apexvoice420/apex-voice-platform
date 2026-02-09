'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, CheckCircle, XCircle, Users } from "lucide-react";

export default function DashboardPage() {
    const kpis = [
        { title: "Calls Today", value: "124", icon: Phone, color: "text-blue-500" },
        { title: "Booked Callbacks", value: "18", icon: CheckCircle, color: "text-green-500" },
        { title: "Missed Calls", value: "5", icon: XCircle, color: "text-red-500" },
        { title: "Active Agents", value: "3", icon: Users, color: "text-purple-500" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your voice AI performance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi) => (
                    <Card key={kpi.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {kpi.title}
                            </CardTitle>
                            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpi.value}</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Call processed</p>
                                        <p className="text-sm text-muted-foreground">
                                            Detailed analysis for caller +155500000{i}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">Just now</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Live Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                            Real-time agent visualization coming soon
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
