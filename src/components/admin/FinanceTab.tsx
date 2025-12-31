
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '@/lib/context/DataContext';
import { useRevenue } from '@/hooks/useRevenue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';
import {
    IndianRupee,
    TrendingUp,
    TrendingDown,
    Plus,
    Trash2,
    Loader2,
    Wallet,
    Receipt,
    DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
    _id: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    addedBy: string;
    description?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function FinanceTab() {
    const { participants, currentUser } = useData();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete Modal State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

    // Edit State
    const [transactionToEdit, setTransactionToEdit] = useState<string | null>(null);
    const [customCategory, setCustomCategory] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        type: 'expense' as 'income' | 'expense',
        category: 'Food',
        description: ''
    });

    // Fetch Transactions
    const fetchTransactions = async () => {
        try {
            const res = await fetch('/api/finance/transactions');
            const data = await res.json();
            if (data.success) {
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch transactions');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // 1. Calculate Revenue (omitted for brevity, assume unchanged or handle via separate chunk if needed)
    // ... useRevenue hook usage ...
    const registrationRevenue = useRevenue(participants);

    // ... useMemo calculations ...
    const { manualIncome, totalExpenses } = useMemo(() => {
        let income = 0;
        let expenses = 0;
        transactions.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expenses += t.amount;
        });
        return { manualIncome: income, totalExpenses: expenses };
    }, [transactions]);

    const totalRevenue = registrationRevenue + manualIncome;
    const netProfit = totalRevenue - totalExpenses;

    // ... Chart Data ...
    const expenseByCategory = useMemo(() => {
        const data: Record<string, number> = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            data[t.category] = (data[t.category] || 0) + t.amount;
        });
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    // Handlers
    const handleEditClick = (t: Transaction) => {
        setFormData({
            title: t.title,
            amount: t.amount.toString(),
            type: t.type,
            category: ['Food', 'Logistics', 'Sponsorship', 'Registration', 'Prize', 'Merch', 'Other'].includes(t.category) ? t.category : 'Custom',
            description: t.description || ''
        });
        if (!['Food', 'Logistics', 'Sponsorship', 'Registration', 'Prize', 'Merch', 'Other'].includes(t.category)) {
            setCustomCategory(t.category);
        } else {
            setCustomCategory('');
        }
        setTransactionToEdit(t._id);
        setIsAddOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.amount) {
            toast.error('Please fill required fields');
            return;
        }

        const finalCategory = formData.category === 'Custom' ? customCategory : formData.category;
        if (formData.category === 'Custom' && !customCategory) {
            toast.error('Please specify custom category');
            return;
        }

        setIsSubmitting(true);
        try {
            const url = '/api/finance/transactions';
            const method = transactionToEdit ? 'PUT' : 'POST';
            const body = {
                ...formData,
                category: finalCategory,
                amount: Number(formData.amount),
                addedBy: currentUser?.name || 'Unknown',
                _id: transactionToEdit // Only used for PUT
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (data.success) {
                toast.success(transactionToEdit ? 'Transaction updated' : 'Transaction added');
                if (transactionToEdit) {
                    setTransactions(prev => prev.map(t => t._id === transactionToEdit ? data.transaction : t));
                } else {
                    setTransactions(prev => [data.transaction, ...prev]);
                }
                setIsAddOpen(false);
                resetForm();
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ title: '', amount: '', type: 'expense', category: 'Food', description: '' });
        setTransactionToEdit(null);
        setCustomCategory('');
    };

    const confirmDelete = async () => {
        if (!transactionToDelete) return;
        try {
            const res = await fetch(`/api/finance/transactions?id=${transactionToDelete}`, { method: 'DELETE' });
            if (res.ok) {
                setTransactions(prev => prev.filter(t => t._id !== transactionToDelete));
                toast.success('Transaction deleted');
                setIsDeleteOpen(false);
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Finance Tracker</h2>
                <Dialog open={isAddOpen} onOpenChange={(open) => {
                    setIsAddOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-brand-primary text-brand-dark hover:bg-brand-secondary" onClick={resetForm}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Transaction
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-brand-surface border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>{transactionToEdit ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
                            <DialogDescription>{transactionToEdit ? 'Update transaction details' : 'Record a manual income or expense'}.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(v: any) => setFormData(prev => ({ ...prev, type: v }))}
                                    >
                                        <SelectTrigger className="bg-brand-dark border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount (₹)</Label>
                                    <Input
                                        type="number"
                                        value={formData.amount}
                                        onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        className="bg-brand-dark border-white/10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g. Samosas for Snacks"
                                    className="bg-brand-dark border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(v) => {
                                        setFormData(prev => ({ ...prev, category: v }));
                                        if (v !== 'Custom') setCustomCategory('');
                                    }}
                                >
                                    <SelectTrigger className="bg-brand-dark border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Food">Food</SelectItem>
                                        <SelectItem value="Logistics">Logistics</SelectItem>
                                        <SelectItem value="Sponsorship">Sponsorship</SelectItem>
                                        <SelectItem value="Registration">Registration</SelectItem>
                                        <SelectItem value="Prize">Prize</SelectItem>
                                        <SelectItem value="Merch">Merch</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                        <SelectItem value="Custom">Custom...</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formData.category === 'Custom' && (
                                    <Input
                                        value={customCategory}
                                        onChange={e => setCustomCategory(e.target.value)}
                                        placeholder="Enter custom category"
                                        className="bg-brand-dark border-white/10 mt-2"
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Description (Optional)</Label>
                                <Input
                                    value={formData.description}
                                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="bg-brand-dark border-white/10"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-brand-primary text-brand-dark">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (transactionToEdit ? 'Update Transaction' : 'Save Transaction')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* KPI Cards (existing code) */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-linear-to-br from-green-500/10 to-transparent border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-400">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-1">
                            <IndianRupee className="w-5 h-5" />
                            {totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Lifetime revenue
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-linear-to-br from-red-500/10 to-transparent border-red-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-400">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-1">
                            <IndianRupee className="w-5 h-5" />
                            {totalExpenses.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Recorded Expenses
                        </p>
                    </CardContent>
                </Card>
                <Card className={`bg-linear-to-br border-white/10 ${netProfit >= 0 ? 'from-blue-500/10 border-blue-500/20' : 'from-orange-500/10 border-orange-500/20'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Net Profit</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold flex items-center gap-1 ${netProfit >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                            <IndianRupee className="w-5 h-5" />
                            {netProfit.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Revenue - Expenses
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                {/* Chart (existing code) */}
                <Card className="col-span-4 border-white/10 bg-white/5">
                    <CardHeader>
                        <CardTitle>Expense Breakdown</CardTitle>
                        <CardDescription>Where is the money going?</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {expenseByCategory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseByCategory}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {expenseByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No expense data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="col-span-3 border-white/10 bg-white/5">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Latest financial activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                            {transactions.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No transactions recorded</p>
                            ) : (
                                transactions.map((t) => (
                                    <div key={t._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{t.title}</div>
                                                <div className="text-xs text-gray-400">{t.category} • {new Date(t.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-mono font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                                {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                            </span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-gray-500 hover:text-blue-400"
                                                    onClick={() => handleEditClick(t)}
                                                >
                                                    <Receipt className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-gray-500 hover:text-red-500"
                                                    onClick={() => {
                                                        setTransactionToDelete(t._id);
                                                        setIsDeleteOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="bg-brand-surface border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-500">Confirm Deletion</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Are you sure you want to delete this transaction? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="border-white/10">Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
