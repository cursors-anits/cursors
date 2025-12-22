import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lab, Participant } from '@/types'; // Assuming 'Team' is derived or we use Participant[]
import { Users, GripVertical, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Team {
    teamId: string;
    teamSize: number;
    type: string;
    isAllocated: boolean;
    assignedWorkshopLab?: string;
    assignedHackathonLab?: string;
    members: Participant[];
}

interface LabAllocationTabProps {
    labs: Lab[];
    teams: Team[];
    onAllocate: (teamId: string, labId: string) => Promise<void>;
}

// Draggable Team Card
const DraggableTeamCard = ({ team }: { team: Team }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: team.teamId,
        data: { team },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`p-3 bg-brand-dark rounded-lg border flex items-center justify-between cursor-move group transition-all ${isDragging ? 'opacity-50 border-brand-primary' : 'border-white/10 hover:border-white/30'
                }`}
        >
            <div className="flex items-center gap-3">
                <GripVertical className="text-gray-600 group-hover:text-gray-400" size={16} />
                <div>
                    <div className="font-mono text-xs text-brand-primary font-bold">{team.teamId}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Users size={12} /> {team.teamSize} members
                    </div>
                </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-white/10 text-gray-400">
                {team.type}
            </Badge>
        </div>
    );
};

// Droppable Lab Area
const DroppableLab = ({ lab, assignedTeams }: { lab: Lab; assignedTeams: Team[] }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: lab._id,
        data: { lab },
    });

    const currentCapacity = assignedTeams.reduce((acc, t) => acc + t.teamSize, 0);
    const progress = (currentCapacity / lab.capacity) * 100;
    const isFull = currentCapacity >= lab.capacity;

    return (
        <div
            ref={setNodeRef}
            className={`p-4 rounded-xl border transition-colors ${isOver && !isFull ? 'bg-brand-primary/10 border-brand-primary' : 'bg-brand-surface border-white/5'
                } ${isFull ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-bold text-white">{lab.name}</h4>
                    <p className="text-xs text-gray-400">Room {lab.roomNumber}</p>
                </div>
                <Badge variant={isFull ? "destructive" : "secondary"}>
                    {currentCapacity}/{lab.capacity}
                </Badge>
            </div>

            {/* Capacity Bar */}
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                <div
                    className={`h-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-brand-primary'}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>

            {/* Assigned Teams Preview */}
            <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Assigned Teams</p>
                <div className="flex flex-wrap gap-1.5">
                    {assignedTeams.length === 0 && <span className="text-xs text-gray-600 italic">Empty</span>}
                    {assignedTeams.slice(0, 5).map(t => (
                        <Badge key={t.teamId} variant="outline" className="bg-brand-dark border-white/5 text-[10px] text-gray-300">
                            {t.teamId}
                        </Badge>
                    ))}
                    {assignedTeams.length > 5 && (
                        <Badge variant="outline" className="bg-brand-dark border-white/5 text-[10px] text-gray-500">
                            +{assignedTeams.length - 5}
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
};

const LabAllocationTab: React.FC<LabAllocationTabProps> = ({ labs, teams, onAllocate }) => {
    const [activeId, setActiveId] = useState<string | null>(null);

    // Initial grouping - derived from props for display
    // In a real app, this would react to the onAllocate prop changing the source data
    const unallocatedTeams = teams.filter(t => !t.isAllocated); // Simplified logic
    const getLabTeams = (labName: string) => teams.filter(t => t.assignedWorkshopLab === labName || t.assignedHackathonLab === labName);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const team = active.data.current?.team as Team;
            const lab = over.data.current?.lab as Lab;

            // Basic validation
            if (!lab || !team) return;

            // Capacity Check Logic would go here in a richer implementation
            // For now, we trust the user or the backend validation

            // Undo Logic Prep
            const originalState = { ...team };

            // Optimistic UI update could happen here if we managed local state
            // But we rely on parent update

            toast.promise(onAllocate(team.teamId, lab.name), {
                loading: `Allocating Team ${team.teamId} to ${lab.name}...`,
                success: (data) => {
                    return `Allocated Team ${team.teamId} to ${lab.name}`;
                },
                error: 'Failed to allocate team',
                action: {
                    label: 'Undo',
                    onClick: () => {
                        // This handles the undo logic simply via callback if needed,
                        // or we can implement a specific undo function passed from parent
                        toast.info("Undo functionality would trigger here");
                    }
                }
            });
        }
    };

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
                {/* Left Panel: Unallocated Teams */}
                <Card className="lg:col-span-1 bg-brand-surface border-white/5 h-full flex flex-col">
                    <CardHeader className="pb-3 border-b border-white/5">
                        <CardTitle className="text-lg font-bold flex items-center justify-between">
                            Unallocated
                            <Badge variant="secondary">{unallocatedTeams.length}</Badge>
                        </CardTitle>
                        <CardDescription>Drag teams to labs on the right</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-full p-4">
                            <div className="space-y-3">
                                {unallocatedTeams.map(team => (
                                    <DraggableTeamCard key={team.teamId} team={team} />
                                ))}
                                {unallocatedTeams.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                        <p>All teams allocated!</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Right Panel: Labs Grid */}
                <div className="lg:col-span-3 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {labs.map(lab => (
                            <DroppableLab
                                key={lab._id}
                                lab={lab}
                                assignedTeams={getLabTeams(lab.name)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Drag Overlay for smooth visual */}
            <DragOverlay>
                {activeId ? (
                    <div className="opacity-90 grayscale">
                        {/* We recreate a simplified card for the overlay */}
                        <div className="p-3 bg-brand-dark rounded-lg border border-brand-primary shadow-2xl w-64">
                            <div className="font-mono text-xs text-brand-primary font-bold">{activeId}</div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default LabAllocationTab;
