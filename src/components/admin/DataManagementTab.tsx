'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CreatableCombobox } from '@/components/ui/creatable-combobox'; // Added import
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Plus, Search, Building2, MapPin, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function DataManagementTab() {
    const { settings, updateSettings, participants, fetchSettings, fetchParticipants } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('colleges');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Edit/Add state
    const [currentEditItem, setCurrentEditItem] = useState<{ old: string, new: string } | null>(null);
    const [newItem, setNewItem] = useState('');

    const getData = () => {
        if (activeTab === 'colleges') return settings?.colleges || [];
        return settings?.cities || [];
    };

    const setData = async (newData: string[]) => {
        try {
            if (activeTab === 'colleges') {
                await updateSettings({ colleges: newData });
            } else {
                await updateSettings({ cities: newData });
            }
            toast.success('List updated successfully');
        } catch (error) {
            toast.error('Failed to update list');
        }
    };

    const handleAdd = async () => {
        if (!newItem.trim()) return;
        const currentData = getData();
        // Case-insensitive duplicate check
        if (currentData.some(item => item.toLowerCase() === newItem.trim().toLowerCase())) {
            toast.error('Item already exists');
            return;
        }

        // Add to list and sort alphabetically
        const newData = [...currentData, newItem.trim()].sort((a, b) => a.localeCompare(b));
        await setData(newData);
        setNewItem('');
        setIsAddDialogOpen(false);
    };

    const handleEdit = async () => {
        if (!currentEditItem || !currentEditItem.new.trim()) return;
        const currentData = getData();

        // Remove old, add new, re-sort
        const newData = currentData.filter(item => item !== currentEditItem.old);
        // Case-insensitive duplicate check
        if (newData.some(item => item.toLowerCase() === currentEditItem.new.trim().toLowerCase())) {
            toast.error('Item already exists');
            return;
        }
        newData.push(currentEditItem.new.trim());
        newData.sort((a, b) => a.localeCompare(b));

        await setData(newData);
        setCurrentEditItem(null);
        setIsEditDialogOpen(false);
    };

    const handleDelete = async (itemToDelete: string) => {
        const currentData = getData();
        const newData = currentData.filter(item => item !== itemToDelete);
        await setData(newData);
    };

    const [isNormalizeDialogOpen, setIsNormalizeDialogOpen] = useState(false);
    const [normalizeTarget, setNormalizeTarget] = useState<{ type: 'college' | 'city', oldName: string, newName: string } | null>(null);
    const [isNormalizing, setIsNormalizing] = useState(false);

    // Compute Pending Items
    const [pendingItems, setPendingItems] = React.useState<{ colleges: string[], cities: string[] }>({ colleges: [], cities: [] });

    React.useEffect(() => {
        if (!settings || !participants) return;

        const knownColleges = new Set((settings.colleges || []).map(c => c.toLowerCase()));
        const knownCities = new Set((settings.cities || []).map(c => c.toLowerCase()));

        const pColleges = new Set<string>();
        const pCities = new Set<string>();

        participants.forEach(p => {
            if (p.college && !knownColleges.has(p.college.toLowerCase())) pColleges.add(p.college);
            if (p.city && !knownCities.has(p.city.toLowerCase())) pCities.add(p.city);

            p.members?.forEach(m => {
                if (m.college && !knownColleges.has(m.college.toLowerCase())) pColleges.add(m.college);
                if (m.city && !knownCities.has(m.city.toLowerCase())) pCities.add(m.city);
            });
        });

        setPendingItems({
            colleges: Array.from(pColleges).sort(),
            cities: Array.from(pCities).sort()
        });
    }, [participants, settings]);

    const handleNormalize = async () => {
        if (!normalizeTarget) return;
        setIsNormalizing(true);
        try {
            const res = await fetch('/api/admin/normalize-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: normalizeTarget.type,
                    oldName: normalizeTarget.oldName,
                    newName: normalizeTarget.newName
                })
            });

            if (!res.ok) throw new Error('Failed to normalize');

            const result = await res.json();
            toast.success(`Updated ${result.participantsUpdated} participants`);

            await Promise.all([fetchSettings(), fetchParticipants(true)]);
            setIsNormalizeDialogOpen(false);
            setNormalizeTarget(null);
        } catch (error) {
            toast.error('Failed to update data');
            console.error(error);
        } finally {
            setIsNormalizing(false);
        }
    };

    const filteredData = getData().filter(item =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Data Management</h2>
                    <p className="text-muted-foreground">Manage reference data for registration forms.</p>
                </div>
            </div>

            <Tabs defaultValue="colleges" className="space-y-6" onValueChange={(v) => { setActiveTab(v); setSearchQuery(''); }}>
                <TabsList className="bg-brand-dark/50 border border-white/5 p-1">
                    <TabsTrigger value="colleges" className="gap-2">
                        <Building2 className="w-4 h-4" />
                        Colleges ({settings?.colleges?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="cities" className="gap-2">
                        <MapPin className="w-4 h-4" />
                        Cities ({settings?.cities?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-yellow-400/10 data-[state=active]:text-yellow-400">
                        <AlertTriangle className="w-4 h-4" />
                        Pending ({pendingItems.colleges.length + pendingItems.cities.length})
                    </TabsTrigger>
                </TabsList>

                {/* Pending Items Tab */}
                <TabsContent value="pending" className="space-y-6">
                    <Card className="bg-brand-surface border-white/5">
                        <CardHeader>
                            <CardTitle>Pending Approvals</CardTitle>
                            <CardDescription>
                                These items were entered by users but are not in the official list. Approve or Merge them to standardize the data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Pending Colleges */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-yellow-400">
                                    <Building2 className="w-4 h-4" />
                                    New Colleges ({pendingItems.colleges.length})
                                </h3>
                                {pendingItems.colleges.length === 0 ? (
                                    <p className="text-sm text-gray-500">No pending colleges found.</p>
                                ) : (
                                    <div className="grid gap-2">
                                        {pendingItems.colleges.map(item => (
                                            <div key={item} className="flex items-center justify-between p-3 bg-brand-dark/50 rounded-lg border border-white/5">
                                                <span className="font-mono text-sm">{item}</span>
                                                <Button
                                                    size="sm"
                                                    className="bg-brand-primary text-brand-dark hover:bg-white"
                                                    onClick={() => {
                                                        setNormalizeTarget({ type: 'college', oldName: item, newName: item });
                                                        setIsNormalizeDialogOpen(true);
                                                    }}
                                                >
                                                    Approve / Edit
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-white/5" />

                            {/* Pending Cities */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-yellow-400">
                                    <MapPin className="w-4 h-4" />
                                    New Cities ({pendingItems.cities.length})
                                </h3>
                                {pendingItems.cities.length === 0 ? (
                                    <p className="text-sm text-gray-500">No pending cities found.</p>
                                ) : (
                                    <div className="grid gap-2">
                                        {pendingItems.cities.map(item => (
                                            <div key={item} className="flex items-center justify-between p-3 bg-brand-dark/50 rounded-lg border border-white/5">
                                                <span className="font-mono text-sm">{item}</span>
                                                <Button
                                                    size="sm"
                                                    className="bg-brand-primary text-brand-dark hover:bg-white"
                                                    onClick={() => {
                                                        setNormalizeTarget({ type: 'city', oldName: item, newName: item });
                                                        setIsNormalizeDialogOpen(true);
                                                    }}
                                                >
                                                    Approve / Edit
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="colleges">
                    <Card className="bg-brand-surface border-white/5">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Registered Colleges</CardTitle>
                                    <CardDescription>
                                        List of all colleges available in the dropdown.
                                    </CardDescription>
                                </div>
                                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-brand-primary text-brand-dark hover:bg-brand-primary/90">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add College
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-brand-surface border-white/10 text-white">
                                        <DialogHeader>
                                            <DialogTitle>Add New College</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <CreatableCombobox
                                                options={getData()}
                                                value={newItem}
                                                onChange={(val) => setNewItem(val)}
                                                onCreate={(val) => setNewItem(val)}
                                                placeholder={`Search or type new ${activeTab === 'colleges' ? 'college' : 'city'}...`}
                                                className="bg-brand-dark/50 border-white/10"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                            <Button onClick={handleAdd} className="bg-brand-primary text-brand-dark">Add Item</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 bg-brand-dark/50 border-white/10 w-full md:w-80"
                                    />
                                </div>
                            </div>

                            <div className="rounded-md border border-white/10">
                                <Table>
                                    <TableHeader className="bg-brand-dark/50">
                                        <TableRow className="border-white/10 hover:bg-transparent">
                                            <TableHead className="text-gray-400">Name</TableHead>
                                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={2} className="h-24 text-center text-gray-500">
                                                    No results found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredData.map((item, index) => (
                                                <TableRow key={index} className="border-white/5 hover:bg-white/5">
                                                    <TableCell className="font-medium">{item}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                                                onClick={() => {
                                                                    setCurrentEditItem({ old: item, new: item });
                                                                    setIsEditDialogOpen(true);
                                                                }}
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>

                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="bg-brand-surface border-white/10 text-white">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription className="text-gray-400">
                                                                            This will remove "{item}" from the list.
                                                                            Note: Historical data using this name will remain unchanged.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 text-white">Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDelete(item)} className="bg-red-500 text-white hover:bg-red-600">Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 text-right">
                                Showing {filteredData.length} records
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cities">
                    <Card className="bg-brand-surface border-white/5">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Supported Cities</CardTitle>
                                    <CardDescription>
                                        List of all cities available in the dropdown.
                                    </CardDescription>
                                </div>
                                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-brand-primary text-brand-dark hover:bg-brand-primary/90">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add City
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-brand-surface border-white/10 text-white">
                                        <DialogHeader>
                                            <DialogTitle>Add New City</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <CreatableCombobox
                                                options={getData()}
                                                value={newItem}
                                                onChange={(val) => setNewItem(val)}
                                                onCreate={(val) => setNewItem(val)}
                                                placeholder={`Search or type new ${activeTab === 'colleges' ? 'college' : 'city'}...`}
                                                className="bg-brand-dark/50 border-white/10"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                            <Button onClick={handleAdd} className="bg-brand-primary text-brand-dark">Add Item</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 bg-brand-dark/50 border-white/10 w-full md:w-80"
                                    />
                                </div>
                            </div>

                            <div className="rounded-md border border-white/10">
                                <Table>
                                    <TableHeader className="bg-brand-dark/50">
                                        <TableRow className="border-white/10 hover:bg-transparent">
                                            <TableHead className="text-gray-400">Name</TableHead>
                                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={2} className="h-24 text-center text-gray-500">
                                                    No results found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredData.map((item, index) => (
                                                <TableRow key={index} className="border-white/5 hover:bg-white/5">
                                                    <TableCell className="font-medium">{item}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                                                onClick={() => {
                                                                    setCurrentEditItem({ old: item, new: item });
                                                                    setIsEditDialogOpen(true);
                                                                }}
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="bg-brand-surface border-white/10 text-white">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription className="text-gray-400">
                                                                            This will remove "{item}" from the list.
                                                                            Note: Historical data using this name will remain unchanged.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 text-white">Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDelete(item)} className="bg-red-500 text-white hover:bg-red-600">Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 text-right">
                                Showing {filteredData.length} records
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-brand-surface border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit {activeTab === 'colleges' ? 'College' : 'City'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <CreatableCombobox
                            options={getData()}
                            value={currentEditItem?.new || ''}
                            onChange={(val) => setCurrentEditItem({ ...currentEditItem!, new: val })}
                            onCreate={(val) => setCurrentEditItem({ ...currentEditItem!, new: val })}
                            placeholder="Select or type new value..."
                            className="bg-brand-dark/50 border-white/10"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEdit} className="bg-brand-primary text-brand-dark">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Normalize Dialog */}
            <Dialog open={isNormalizeDialogOpen} onOpenChange={setIsNormalizeDialogOpen}>
                <DialogContent className="bg-brand-surface border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Approve or Edit Pending Item</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            You are approving "{normalizeTarget?.oldName}". You can edit the name before saving, which will update all referencing participants.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Standardized Name</label>
                            <Input
                                placeholder="Enter correct name..."
                                value={normalizeTarget?.newName || ''}
                                onChange={(e) => setNormalizeTarget(prev => prev ? ({ ...prev, newName: e.target.value }) : null)}
                                className="bg-brand-dark/50 border-white/10"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNormalizeDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleNormalize} disabled={isNormalizing} className="bg-brand-primary text-brand-dark">
                            {isNormalizing ? 'Processing...' : 'Approve & Merge'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
