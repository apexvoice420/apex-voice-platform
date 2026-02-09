import Link from "next/link";
import { Button } from "@/components/ui/button";
import WorkflowBuilder from "@/components/automation/workflow-builder";

export const revalidate = 0;

export default function AutomationPage() {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <h1 className="text-3xl font-bold tracking-tight">Automation</h1>
                <Button>
                    New Workflow
                </Button>
            </div>

            <div className="flex-1">
                <WorkflowBuilder />
            </div>
        </div>
    );
}
