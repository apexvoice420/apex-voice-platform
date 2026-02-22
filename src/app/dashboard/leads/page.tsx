export const dynamic = 'force-dynamic';

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search, ExternalLink, Phone, Mail, Globe, Star } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-voice-crm-production.up.railway.app';

async function getLeads() {
    try {
        const res = await fetch(`${API_URL}/api/leads?limit=100`, {
            cache: 'no-store'
        });
        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        console.error('Failed to fetch leads:', e);
        return [];
    }
}

export default async function LeadsPage() {
    const leads = await getLeads();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
                    <p className="text-muted-foreground">
                        {leads.length} leads from Google Maps scraper
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search leads..."
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Business</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.map((lead: any) => (
                            <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
                                <TableCell>
                                    <Link href={`/dashboard/leads/${lead.id}`} className="block">
                                        <div className="font-medium">{lead.business_name}</div>
                                        {lead.website && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Globe className="h-3 w-3" />
                                                {new URL(lead.website).hostname}
                                            </div>
                                        )}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {lead.phone ? (
                                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:underline">
                                            <Phone className="h-3 w-3" />
                                            {lead.phone}
                                        </a>
                                    ) : '-'}
                                </TableCell>
                                <TableCell>
                                    {lead.email ? (
                                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                                            <Mail className="h-3 w-3" />
                                            {lead.email}
                                        </a>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div>{lead.city}, {lead.state}</div>
                                    {lead.industry && (
                                        <div className="text-xs text-muted-foreground capitalize">{lead.industry}</div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {lead.rating ? (
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <span>{lead.rating}</span>
                                            {lead.reviews && (
                                                <span className="text-xs text-muted-foreground">({lead.reviews})</span>
                                            )}
                                        </div>
                                    ) : '-'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={lead.status === 'New Lead' ? 'default' : 'secondary'}>
                                        {lead.status || 'New'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/dashboard/leads/${lead.id}`}>
                                        <Button variant="ghost" size="sm">View</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                        {leads.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No leads yet. Run the scraper to add leads.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
