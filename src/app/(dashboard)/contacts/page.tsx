'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search } from 'lucide-react';

interface Contact {
    id: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    email?: string;
    tags: string[];
    createdAt: string;
}

export default function ContactsPage() {
    const { clientId } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!clientId) return;

        const fetchContacts = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/contacts?clientId=${clientId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setContacts(data);
                }
            } catch (error) {
                console.error("Error fetching contacts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, [clientId]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
                    <p className="text-muted-foreground">Manage your detailed contact list.</p>
                </div>
                <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Contact
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search contacts..." className="pl-9" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead>Added</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">Loading contacts...</TableCell>
                                </TableRow>
                            ) : contacts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No contacts found.</TableCell>
                                </TableRow>
                            ) : (
                                contacts.map(contact => (
                                    <TableRow key={contact.id}>
                                        <TableCell className="font-medium">{contact.firstName} {contact.lastName}</TableCell>
                                        <TableCell>{contact.phone || '-'}</TableCell>
                                        <TableCell>{contact.email || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {contact.tags?.map(tag => (
                                                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
