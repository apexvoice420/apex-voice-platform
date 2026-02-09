'use client';

import React, { useCallback, useState } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const initialNodes: Node[] = [
    { id: '1', position: { x: 250, y: 100 }, data: { label: 'Trigger: Inbound Call' }, type: 'input' },
    { id: '2', position: { x: 250, y: 250 }, data: { label: 'Action: AI Voice Agent' } },
];

const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

// import { saveWorkflow } from "@/lib/actions/workflows";

export default function WorkflowBuilder() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [saving, setSaving] = useState(false);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const handleSave = async () => {
        setSaving(true);
        // Mock save
        console.log("Saving workflow:", nodes, edges);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        alert("Workflow saved (mock)!");
    };

    return (
        <div className="h-[600px] w-full border rounded-lg bg-[hsl(var(--background))]">
            <div className="p-4 border-b flex justify-between items-center bg-[hsl(var(--card))]">
                <h3 className="font-semibold">Workflow Editor</h3>
                <Button onClick={handleSave} size="sm" isLoading={saving}>Save Workflow</Button>
            </div>
            <div style={{ height: 'calc(100% - 70px)' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <Controls />
                    <MiniMap className="bg-[hsl(var(--muted))]" />
                    <Background gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
}
