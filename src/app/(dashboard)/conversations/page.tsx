'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send, Phone, Video, MoreVertical } from 'lucide-react';
import { clsx } from 'clsx';

interface Conversation {
    id: string;
    contactId: string;
    lastMessageAt: string;
    snippet: string;
    status: 'open' | 'closed';
}

interface Message {
    id: string;
    conversationId: string;
    content: string;
    direction: 'inbound' | 'outbound';
    createdAt: string;
}

export default function ConversationsPage() {
    const { clientId } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!clientId) return;

        const fetchConversations = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/conversations?clientId=${clientId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data);
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        fetchConversations();
    }, [clientId]);

    useEffect(() => {
        if (!selectedConversationId) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/messages?conversationId=${selectedConversationId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, [selectedConversationId]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversationId || !clientId) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({
                    conversationId: selectedConversationId,
                    content: newMessage,
                    channel: 'sms',
                    direction: 'outbound',
                }),
            });
            
            if (res.ok) {
                const msg = await res.json();
                setMessages(prev => [...prev, msg]);
                setNewMessage('');
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
            {/* Sidebar List */}
            <div className="w-80 border-r flex flex-col">
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search messages..." className="pl-9" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet</div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConversationId(conv.id || null)}
                                className={clsx(
                                    "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                                    selectedConversationId === conv.id ? "bg-muted" : ""
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-sm">Customer {conv.contactId?.substring(0, 4)}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(conv.lastMessageAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{conv.snippet || 'No messages'}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 flex flex-col">
                {selectedConversationId ? (
                    <>
                        <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {selectedConversationId.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold">Conversation</h3>
                                    <p className="text-xs text-muted-foreground">Active now</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Phone className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Video className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={clsx(
                                        "flex",
                                        msg.direction === 'outbound' ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div className={clsx(
                                        "max-w-[70%] rounded-lg px-4 py-2 text-sm",
                                        msg.direction === 'outbound'
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    )}>
                                        {msg.content}
                                        <div className={clsx(
                                            "text-[10px] mt-1 text-right opacity-70",
                                            msg.direction === 'outbound' ? "text-primary-foreground" : "text-muted-foreground"
                                        )}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t bg-background">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button onClick={handleSendMessage}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a conversation to start messaging
                    </div>
                )}
            </div>
        </div>
    );
}
