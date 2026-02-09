'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "@/components/providers/auth-provider";

export function CreateOpportunityDialog({ pipelineId }: { pipelineId: string }) {
    const [open, setOpen] = useState(false);
    const { clientId } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!clientId) return;

        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            await addDoc(collection(db, "opportunities"), {
                clientId,
                pipelineId,
                title: formData.get("title"),
                value: Number(formData.get("value") || 0),
                contactId: formData.get("contactId") || 'temp-contact-id', // Simplified for demo
                stageId: 'new_lead', // Default stage
                status: 'open',
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            setOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Opportunity
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogHeader>
                    <DialogTitle>Create Opportunity</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input id="title" name="title" className="col-span-3" required placeholder="Deal Name" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">
                            Value ($)
                        </Label>
                        <Input id="value" name="value" type="number" className="col-span-3" />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </>
    );
}
