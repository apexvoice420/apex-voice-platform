'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/components/providers/auth-provider';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Opportunity, Pipeline, PipelineStage } from '@/types/schema';

// Styles for DnD
const draggablestyle = {
    cursor: 'grab',
};

function DroppableStage({ stage, children }: { stage: PipelineStage, children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({
        id: stage.id,
    });

    return (
        <div ref={setNodeRef} className="bg-muted/50 p-4 rounded-lg w-72 min-h-[500px] flex flex-col gap-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">{stage.name}</h3>
            {children}
        </div>
    );
}

function DraggableCard({ opportunity }: { opportunity: Opportunity }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: opportunity.id || 'temp',
        data: opportunity
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        ...draggablestyle
    } : draggablestyle;

    return (
        <Card ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <p className="font-medium">{opportunity.title}</p>
                <p className="text-sm text-muted-foreground">${opportunity.value}</p>
            </CardContent>
        </Card>
    );
}

export default function PipelinesPage() {
    const { clientId } = useAuth();
    const [pipeline, setPipeline] = useState<Pipeline | null>(null);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        if (!clientId) return;

        // Mock default pipeline if none exists in DB for demo
        // In real app, fetch from 'pipelines' collection
        const defaultPipeline: Pipeline = {
            clientId,
            name: "Default Pipeline",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            stages: [
                { id: "new_lead", name: "New Lead", order: 1 },
                { id: "contacted", name: "Contacted", order: 2 },
                { id: "appointment", name: "Appointment Set", order: 3 },
                { id: "negotiation", name: "Negotiation", order: 4 },
                { id: "won", name: "Closed Won", order: 5 },
            ]
        };
        setPipeline(defaultPipeline);

        // Fetch Opportunities
        const fetchOpps = async () => {
            // Mock data for demo if DB empty
            setOpportunities([
                { id: '1', title: 'Acme Corp Deal', value: 5000, stageId: 'new_lead', clientId, pipelineId: '1', contactId: 'c1', status: 'open', createdAt: Date.now(), updatedAt: Date.now() },
                { id: '2', title: 'Global Tech', value: 12000, stageId: 'contacted', clientId, pipelineId: '1', contactId: 'c2', status: 'open', createdAt: Date.now(), updatedAt: Date.now() },
                { id: '3', title: 'Small Biz bundle', value: 800, stageId: 'won', clientId, pipelineId: '1', contactId: 'c3', status: 'won', createdAt: Date.now(), updatedAt: Date.now() },
            ]);

            // Real code would use:
            /*
            const q = query(collection(db, 'opportunities'), where('clientId', '==', clientId));
            const snap = await getDocs(q);
            // ...
            */
        };
        fetchOpps();

    }, [clientId]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const newStageId = over.id as string;
            // Optimistic Update
            setOpportunities((items) => items.map(item =>
                item.id === active.id ? { ...item, stageId: newStageId } : item
            ));

            // TODO: Update in Firestore
            /*
            if (active.id) {
                await updateDoc(doc(db, 'opportunities', active.id as string), { stageId: newStageId });
            }
            */
        }
        setActiveId(null);
    };

    if (!pipeline) return <div>Loading pipeline...</div>;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Pipelines</h2>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <DndContext onDragEnd={handleDragEnd} onDragStart={(e) => setActiveId(e.active.id as string)}>
                    <div className="flex gap-4 h-full min-w-max">
                        {pipeline.stages.map((stage) => (
                            <DroppableStage key={stage.id} stage={stage}>
                                {opportunities
                                    .filter(opp => opp.stageId === stage.id)
                                    .map(opp => (
                                        <DraggableCard key={opp.id} opportunity={opp} />
                                    ))
                                }
                            </DroppableStage>
                        ))}
                    </div>
                    <DragOverlay>
                        {activeId ? (
                            <Card className="cursor-grabbing shadow-lg opacity-80 rotate-2">
                                <CardContent className="p-4">
                                    {/* Simple overlay content, fetch full logic if needed */}
                                    Dragging...
                                </CardContent>
                            </Card>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}
