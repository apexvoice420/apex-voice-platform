export const dynamic = 'force-dynamic';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Phone, 
    Mail, 
    Globe, 
    MapPin, 
    Star, 
    ArrowLeft,
    ExternalLink,
    MessageSquare,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-voice-crm-production.up.railway.app';

async function getLead(id: string) {
    try {
        const res = await fetch(`${API_URL}/api/leads/${id}`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        console.error('Failed to fetch lead:', e);
        return null;
    }
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
    const lead = await getLead(params.id);
    
    if (!lead) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Back button */}
            <Link href="/dashboard/leads" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Leads
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{lead.business_name}</h1>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        {lead.industry && (
                            <Badge variant="outline" className="capitalize">{lead.industry}</Badge>
                        )}
                        <span>{lead.city}, {lead.state}</span>
                    </div>
                </div>
                <Badge variant={lead.status === 'New Lead' ? 'default' : 'secondary'} className="text-sm">
                    {lead.status || 'New'}
                </Badge>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                {lead.rating && (
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            Rating
                        </div>
                        <div className="text-2xl font-bold">{lead.rating}</div>
                        {lead.reviews && (
                            <div className="text-xs text-muted-foreground">{lead.reviews} reviews</div>
                        )}
                    </div>
                )}
                
                <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        Added
                    </div>
                    <div className="text-lg font-medium">
                        {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                </div>

                <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <MessageSquare className="h-4 w-4" />
                        Source
                    </div>
                    <div className="text-lg font-medium">{lead.source || 'Google Maps'}</div>
                </div>

                <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <MapPin className="h-4 w-4" />
                        Address
                    </div>
                    <div className="text-sm font-medium truncate">{lead.address || 'Not available'}</div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Phone */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Phone</div>
                            {lead.phone ? (
                                <a href={`tel:${lead.phone}`} className="font-medium hover:underline">
                                    {lead.phone}
                                </a>
                            ) : (
                                <span className="text-muted-foreground">Not available</span>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100 text-green-600">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Email</div>
                            {lead.email ? (
                                <a href={`mailto:${lead.email}`} className="font-medium text-green-600 hover:underline">
                                    {lead.email}
                                </a>
                            ) : (
                                <span className="text-muted-foreground">Not available</span>
                            )}
                        </div>
                    </div>

                    {/* Website */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                            <Globe className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Website</div>
                            {lead.website ? (
                                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="font-medium text-purple-600 hover:underline flex items-center gap-1">
                                    Visit Site
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            ) : (
                                <span className="text-muted-foreground">Not available</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Notes</h2>
                <p className="text-muted-foreground">
                    {lead.notes || 'No notes yet. Click to add notes.'}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button asChild>
                    <Link href={`/dashboard/leads/${lead.id}/call`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call Lead
                    </Link>
                </Button>
                {lead.email && (
                    <Button variant="outline" asChild>
                        <a href={`mailto:${lead.email}`}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                        </a>
                    </Button>
                )}
                {lead.website && (
                    <Button variant="outline" asChild>
                        <a href={lead.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="mr-2 h-4 w-4" />
                            View Website
                        </a>
                    </Button>
                )}
            </div>
        </div>
    );
}
