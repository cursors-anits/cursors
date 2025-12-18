'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    X,
    CheckCircle,
    Loader2,
    ArrowRight,
    ArrowLeft,
    Upload,
    Users,
    MapPin,
    School,
    Info,
    Mail,
    Zap,
    Terminal,
    Cpu
} from 'lucide-react';
import { FormData, TeamMember } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const COLLEGES = [
    "Aditya Institute of Technology and Management [AITAM]",
    "Andhra University College of Engineering [AUCE]",
    "Andhra University College of Engineering for Women [AUCEW]",
    "Anil Neerukonda Institute of Technology and Sciences [ANITS]",
    "Avanthi Institute Of Engineering and Technology [AIET]",
    "Baba Institute of Technology and Sciences [BITS]",
    "Behara College of Engineering and Technology [BCET]",
    "Centurion University of Technology and Management [CUTM]",
    "Chaitanya Engineering College [CEC]",
    "Dr. Lankapalli Bullayya College [LBCE]",
    "Gandhi Institute of Technology and Management [GITAM]",
    "Gayatri Vidya Parishad College for Degree & P.G. Courses [GVPCDPGC]",
    "Gayatri Vidya Parishad College of Engineering [GVPCE]",
    "Gayatri Vidya Parishad College of Engineering Women [GVPCEW]",
    "GMR Institute of Technology [GMRIT]",
    "Jawaharlal Nehru Technological University - Gurajada [JNTU-GV]",
    "Lendi Institute of Engineering & Technology [LIET]",
    "Maharaj Vijayaram Gajapathi Raj College of Engineering [MVGR]",
    "Nadimpalli Satyanarayana Raju Institute of Technology [NSRIT]",
    "N S Raju Institute of Engineering and Technology [NSRIET]",
    "Pydah College of Engineering and Technology [PCET]",
    "Raghu Engineering College (Autonomous) [REC]",
    "Raghu Institute of Technology [RIT]",
    "Sanketika Vidya Parishad Engineering College [SVPEC]",
    "Vignan's Institute of Engineering for Women [VIEW]",
    "Vignan's Institute of Information Technology [VIIT]",
    "Visakha Institute of Engineering and Technology [VIET]",
    "Other"
];

const CITIES = [
    "Visakhapatnam", "Vizianagaram", "Srikakulam", "Bhimavaram", "Rajahmundry", "Other"
];

const PRICES = {
    workshop: 199,
    hackathon: 349,
    combo: 499
};

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generatedData, setGeneratedData] = useState<{ teamId: string, passkeys: string[] } | null>(null);

    const [formData, setFormData] = useState<FormData>({
        college: '',
        otherCollege: '',
        city: '',
        otherCity: '',
        ticketType: 'combo',
        teamSize: 1,
        members: [{ fullName: '', department: '', whatsapp: '', year: '3rd Year' }],
        transactionId: '',
        screenshot: null
    });

    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setIsSuccess(false);
            setErrors({});
            setFormData({
                college: '',
                otherCollege: '',
                city: '',
                otherCity: '',
                ticketType: 'combo',
                teamSize: 1,
                members: [{ fullName: '', department: '', whatsapp: '', year: '3rd Year' }],
                transactionId: '',
                screenshot: null
            });
            setScreenshotPreview(null);
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, screenshot: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTeamSizeChange = (size: number) => {
        const newMembers = [...formData.members];
        if (size > newMembers.length) {
            for (let i = newMembers.length; i < size; i++) {
                newMembers.push({ fullName: '', department: '', whatsapp: '', year: '3rd Year' });
            }
        } else {
            newMembers.splice(size);
        }
        setFormData(prev => ({ ...prev, teamSize: size, members: newMembers }));
    };

    const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
        const newMembers = [...formData.members];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setFormData(prev => ({ ...prev, members: newMembers }));
    };

    const calculatePricing = () => {
        const basePrice = PRICES[formData.ticketType];
        const teamSize = formData.teamSize;
        const discount = (teamSize - 1) * 10;
        const pricePerPerson = basePrice - discount;
        return {
            total: pricePerPerson * teamSize,
            perPerson: pricePerPerson
        };
    };

    const validateStep = (s: number) => {
        const newErrors: Record<string, string> = {};
        if (s === 1) {
            if (!formData.college) newErrors.college = "College is required";
            if (!formData.city) newErrors.city = "City is required";
        } else if (s === 2) {
            formData.members.forEach((m, i) => {
                if (!m.fullName) newErrors[`m${i}_name`] = "Name is required";
                if (!m.whatsapp || m.whatsapp.length < 10) newErrors[`m${i}_wa`] = "Valid WhatsApp is required";
            });
        } else if (s === 3) {
            if (!formData.transactionId) newErrors.tx = "Transaction ID is required";
            if (!formData.screenshot) newErrors.screenshot = "Screenshot is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep(3)) return;

        setIsSubmitting(true);
        try {
            // In a real app, we would use FormData for file uploads
            // For this demo, we'll simulate the API call with the registration endpoint
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    screenshot: 'simulated-url' // Replace with actual upload in production
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed');

            setGeneratedData({
                teamId: data.teamId,
                passkeys: data.passkeys
            });
            setIsSuccess(true);
        } catch (err: any) {
            setErrors({ submit: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const pricing = calculatePricing();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl bg-brand-surface border-white/10 text-white p-0 overflow-hidden max-h-[90vh] flex flex-col">
                <DialogHeader className="p-6 border-b border-white/5 bg-brand-dark/50">
                    <div className="flex justify-between items-center">
                        <div>
                            <DialogTitle className="text-2xl font-bold">
                                {step === 1 && "Event Details"}
                                {step === 2 && "Team Members"}
                                {step === 3 && "Payment Verification"}
                                {isSuccess && "Registration Success!"}
                            </DialogTitle>
                            <p className="text-sm text-gray-400 mt-1">
                                {isSuccess ? "Welcome to Vibe Coding 2025" : `Step ${step} of 3 • Registration`}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    {isSuccess && generatedData ? (
                        <div className="flex flex-col items-center text-center py-8 space-y-6">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-3xl font-bold">Registration Complete!</h3>
                            <div className="bg-brand-dark p-6 rounded-2xl border border-brand-primary/20 w-full max-w-md">
                                <p className="text-gray-400 mb-2">Your Team ID</p>
                                <p className="text-3xl font-mono font-bold text-brand-primary">{generatedData.teamId}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                {formData.members.map((m, i) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10 text-left">
                                        <p className="text-xs text-gray-500 uppercase">{m.fullName}</p>
                                        <p className="font-mono text-brand-secondary font-bold">{generatedData.passkeys[i]}</p>
                                    </div>
                                ))}
                            </div>
                            <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-300">
                                <Info className="w-4 h-4" />
                                <AlertDescription>
                                    Login using your email and the generated passkey to access your dashboard.
                                </AlertDescription>
                            </Alert>
                            <Button onClick={onClose} className="bg-white text-brand-dark hover:bg-gray-100">
                                Return to Landing
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {step === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                                    <div className="space-y-4 md:col-span-2">
                                        <Label>College / University</Label>
                                        <Select onValueChange={(v) => setFormData({ ...formData, college: v })} value={formData.college}>
                                            <SelectTrigger className="bg-brand-dark border-gray-800">
                                                <SelectValue placeholder="Select College" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COLLEGES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-4">
                                        <Label>City</Label>
                                        <Select onValueChange={(v) => setFormData({ ...formData, city: v })} value={formData.city}>
                                            <SelectTrigger className="bg-brand-dark border-gray-800">
                                                <SelectValue placeholder="Select City" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-4">
                                        <Label>Ticket Type</Label>
                                        <Select onValueChange={(v: any) => setFormData({ ...formData, ticketType: v })} value={formData.ticketType}>
                                            <SelectTrigger className="bg-brand-dark border-gray-800">
                                                <SelectValue placeholder="Select Pass" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="workshop">Workshop (₹199)</SelectItem>
                                                <SelectItem value="hackathon">Hackathon (₹349)</SelectItem>
                                                <SelectItem value="combo">Combo Pass (₹499)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                        <Label>Team Size (1-5)</Label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <Button
                                                    key={n}
                                                    type="button"
                                                    variant={formData.teamSize === n ? "default" : "outline"}
                                                    className={formData.teamSize === n ? "bg-brand-primary text-brand-dark" : "bg-brand-dark border-gray-800"}
                                                    onClick={() => handleTeamSizeChange(n)}
                                                >
                                                    {n}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    {formData.members.map((m, i) => (
                                        <div key={i} className="p-4 bg-brand-dark/50 rounded-xl border border-white/5 space-y-4">
                                            <p className="text-xs font-bold text-brand-primary uppercase">Member {i + 1} {i === 0 && "(Leader)"}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    placeholder="Full Name"
                                                    className="bg-brand-dark border-gray-800"
                                                    value={m.fullName}
                                                    onChange={(e) => handleMemberChange(i, 'fullName', e.target.value)}
                                                />
                                                <Input
                                                    placeholder="WhatsApp Number"
                                                    className="bg-brand-dark border-gray-800"
                                                    value={m.whatsapp}
                                                    onChange={(e) => handleMemberChange(i, 'whatsapp', e.target.value)}
                                                />
                                                <Input
                                                    placeholder="Department"
                                                    className="bg-brand-dark border-gray-800"
                                                    value={m.department}
                                                    onChange={(e) => handleMemberChange(i, 'department', e.target.value)}
                                                />
                                                <Select onValueChange={(v) => handleMemberChange(i, 'year', v)} value={m.year}>
                                                    <SelectTrigger className="bg-brand-dark border-gray-800">
                                                        <SelectValue placeholder="Year" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1st Year">1st Year</SelectItem>
                                                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                                                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                                                        <SelectItem value="4th Year">4th Year</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <div className="bg-brand-dark p-6 rounded-2xl border border-white/5 text-center">
                                        <p className="text-gray-400 mb-2">Total Amount to Pay</p>
                                        <p className="text-4xl font-bold text-white">₹{pricing.total}</p>
                                        <p className="text-xs text-brand-primary mt-1">₹{pricing.perPerson} per person (Group Discount Applied)</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                        <div className="bg-white p-4 rounded-xl flex items-center justify-center aspect-square max-w-[200px] mx-auto">
                                            <div className="text-black font-bold text-center">
                                                <Zap className="w-12 h-12 mx-auto text-brand-secondary" />
                                                <p className="text-xs mt-2">8897892720@ybl</p>
                                                <p className="text-[10px] text-gray-500">Scan to Pay</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Transaction ID (UTR)</Label>
                                                <Input
                                                    placeholder="Enter 12-digit UTR"
                                                    className="bg-brand-dark border-gray-800 font-mono"
                                                    value={formData.transactionId}
                                                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Upload Screenshot</Label>
                                                <div className="relative border-2 border-dashed border-gray-800 rounded-xl p-6 text-center hover:border-brand-primary transition-colors cursor-pointer">
                                                    <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                                                    {screenshotPreview ? (
                                                        <div className="relative h-20 w-full">
                                                            <Image
                                                                src={screenshotPreview}
                                                                alt="Preview"
                                                                fill
                                                                className="object-contain"
                                                                unoptimized
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <Upload className="w-8 h-8 mx-auto text-gray-500" />
                                                            <p className="text-xs text-gray-400">Click or Drag Image</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                {!isSuccess && (
                    <div className="p-6 border-t border-white/5 flex justify-between bg-brand-dark/50">
                        {step > 1 ? (
                            <Button variant="outline" onClick={() => setStep(step - 1)} className="border-gray-800">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                        ) : <div></div>}

                        <Button
                            onClick={step === 3 ? handleSubmit : () => step < 3 && validateStep(step) && setStep(step + 1)}
                            disabled={isSubmitting}
                            className="bg-brand-primary text-brand-dark hover:bg-brand-secondary hover:text-white"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                step === 3 ? "Complete Registration" : "Next Step"}
                            {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default RegistrationModal;
