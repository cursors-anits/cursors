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
    CheckCircle,
    Loader2,
    ArrowRight,
    ArrowLeft,
    Upload,
    Info,
    Zap,
    LayoutDashboard,
    ShieldCheck,
    AlertCircle,
    AlertTriangle
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { CreatableCombobox } from '@/components/ui/creatable-combobox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegistrationSchema, FormData as IFormData } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useData } from '@/lib/context/DataContext';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PRICES = {
    hackathon: 349
};

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [generatedData, setGeneratedData] = useState<{ teamId: string, teamEmail: string, passkey: string, scheduled?: boolean } | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [sameAsLead, setSameAsLead] = useState<Record<number, boolean>>({});
    const router = useRouter();
    const { setCurrentUser, settings, participants, updateSettings } = useData();

    // Data Management (Local only for registration session)
    const [localColleges, setLocalColleges] = useState<string[]>([]);
    const [localCities, setLocalCities] = useState<string[]>([]);

    useEffect(() => {
        if (settings?.colleges) setLocalColleges(settings.colleges);
    }, [settings?.colleges]);

    useEffect(() => {
        if (settings?.cities) setLocalCities(settings.cities);
    }, [settings?.cities]);

    const handleCreateCollege = (newCollege: string) => {
        const normalizedNew = newCollege.trim();
        if (!normalizedNew) return;

        // Update local list for this session so other members can pick it
        setLocalColleges(prev => {
            if (prev.some(c => c.toLowerCase() === normalizedNew.toLowerCase())) return prev;
            return [...prev, normalizedNew].sort((a, b) => a.localeCompare(b));
        });
        // We do NOT update global settings here to prevent 401 errors for guests
    };

    const handleCreateCity = (newCity: string) => {
        const normalizedNew = newCity.trim();
        if (!normalizedNew) return;

        setLocalCities(prev => {
            if (prev.some(c => c.toLowerCase() === normalizedNew.toLowerCase())) return prev;
            return [...prev, normalizedNew].sort((a, b) => a.localeCompare(b));
        });
    };

    // CRM/FOMO Logic
    const [isBufferMode, setIsBufferMode] = useState(false);

    // Calculate counts
    // All participants are hackathon type now
    const hackathonCount = participants?.filter(p => p.type === 'Hackathon' || p.type === 'Combo').length || 0;



    const {
        control,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors, isSubmitting },
        reset
    } = useForm<IFormData>({
        resolver: zodResolver(RegistrationSchema), // We will bypass for buffer mode in step validation
        defaultValues: {
            ticketType: 'hackathon',
            teamSize: 1,
            members: [{ fullName: '', email: '', college: '', city: '', department: '', whatsapp: '', year: '3rd Year' }],
            transactionId: '',
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'members'
    });

    const teamSize = watch('teamSize');
    const ticketType = watch('ticketType');

    useEffect(() => {
        if (!settings?.bufferConfig) return;
        const limit = settings.bufferConfig.hackathonLimit;
        const current = hackathonCount;
        if (current >= limit) setIsBufferMode(true);
        else setIsBufferMode(false);
    }, [ticketType, settings, participants, hackathonCount]);

    useEffect(() => {
        if (!settings?.bufferConfig) return;

        const limit = settings.bufferConfig.hackathonLimit;
        const current = hackathonCount;

        if (current >= limit) {
            setIsBufferMode(true);
        } else {
            setIsBufferMode(false);
        }
    }, [ticketType, settings, participants, hackathonCount]);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setIsSuccess(false);
            reset();
            setGeneratedData(null);
            setScreenshotPreview(null);
            setSelectedFile(null);
        }
    }, [isOpen, reset]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setScreenshotPreview(base64);
                setValue('screenshot', base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTeamSizeChange = (size: number) => {
        const currentSize = fields.length;
        if (size > currentSize) {
            for (let i = currentSize; i < size; i++) {
                append({ fullName: '', email: '', college: '', city: '', department: '', whatsapp: '', year: '3rd Year' });
            }
        } else {
            for (let i = currentSize - 1; i >= size; i--) {
                remove(i);
            }
        }
        setValue('teamSize', size);
    };

    const calculatePricing = () => {
        const basePrice = PRICES[ticketType] || 499;
        // Group discount: Each member gets ₹10 OFF per additional member
        const discountPerPerson = (teamSize - 1) * 10;
        const pricePerPerson = basePrice - discountPerPerson;
        const total = pricePerPerson * teamSize;
        return {
            total,
            basePrice,
            discountPerPerson,
            totalDiscount: discountPerPerson * teamSize,
            perPerson: pricePerPerson
        };
    };

    const handleSameAsLeadToggle = (index: number, checked: boolean) => {
        if (checked && index > 0) {
            const leader = watch('members.0');
            setValue(`members.${index}.college`, leader.college || '');
            setValue(`members.${index}.city`, leader.city || '');
            setValue(`members.${index}.department`, leader.department || '');
            setValue(`members.${index}.year`, leader.year || '');
        }
        setSameAsLead(prev => ({ ...prev, [index]: checked }));
    };

    const nextStep = async () => {
        let fieldsToValidate: (keyof IFormData)[] = [];
        if (step === 1) {
            setStep(step + 1);
            return;
        }
        if (step === 2) fieldsToValidate = ['ticketType', 'teamSize'];
        if (step === 3) fieldsToValidate = ['members'];

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            if (isBufferMode && step === 3) {
                // Skip payment step for buffer mode
                // We need to trigger submission here or set a flag? 
                // The button in JSX handles submission.
                // We'll update the button logic to call onSubmit if isBufferMode && step === 3.
                return;
            }
            setStep(step + 1);
        }
        else toast.error('Please correct the errors before proceeding');
    };

    const onSubmit = async (data: IFormData) => {
        try {
            const formData = new FormData();

            // Handle Buffer Mode - Bypass payment validation details
            const finalData = { ...data };
            if (isBufferMode) {
                finalData.transactionId = "BUFFER-REQUEST";
                finalData.screenshot = "BUFFER-REQUEST";
            }

            const { screenshot, ...rest } = finalData;
            formData.append('data', JSON.stringify({ ...rest, status: isBufferMode ? 'pending' : 'approved' }));

            if (selectedFile && !isBufferMode) {
                formData.append('screenshot', selectedFile);
            }

            const response = await fetch('/api/register', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Registration failed');

            setGeneratedData({
                teamId: result.teamId,
                teamEmail: result.teamEmail,
                passkey: result.passkey,
                scheduled: result.scheduled
            });
            setIsSuccess(true);
            toast.success(result.message || 'Registration successful!');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed';
            toast.error(errorMessage);
        }
    };


    const handleAutoLogin = async () => {
        if (!generatedData) return;
        setIsAutoLoggingIn(true);

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: generatedData.teamEmail,
                    passkey: generatedData.passkey,
                    role: 'participant'
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Auto-login failed');

            setCurrentUser(data.user);
            toast.success('Login successful! Redirecting...');

            // Allow toast to show before redirect
            setTimeout(() => {
                router.push('/dashboard/participant');
                onClose();
            }, 1000);

        } catch (error) {
            console.error(error);
            toast.error('Auto-login failed. Please login manually.');
        } finally {
            setIsAutoLoggingIn(false);
        }
    };

    const pricing = calculatePricing();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl bg-brand-surface border-white/10 text-white p-0 overflow-hidden h-[90vh] max-h-[90vh] flex flex-col">
                <DialogHeader className="p-6 bg-brand-dark/50 shrink-0">
                    <Separator className="bg-white/5 absolute bottom-0 left-0 w-full" />
                    <div className="flex justify-between items-center text-left">
                        <div className="w-full">
                            <DialogTitle className="text-2xl font-bold">
                                {isSuccess ? "Registration Success!" : (
                                    <>
                                        {step === 1 && "🎉 Get Ready for Vibe Coding 2026!"}
                                        {step === 2 && "Event Details"}
                                        {step === 3 && "Team Members"}
                                        {step === 4 && "Payment Verification"}
                                    </>
                                )}
                            </DialogTitle>
                            <p className="text-sm text-gray-400 mt-1">
                                {isSuccess ? "Welcome to Vibe Coding 2026" : step === 1 ? "Important Event Information" : `Step ${step - 1} of 3 • Registration`}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 min-h-0 w-full">
                    <div className="p-6">
                        {isSuccess && generatedData ? (
                            <div className="flex flex-col items-center text-center py-4 space-y-6">
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold">Registration Complete!</h3>
                                <div className="bg-brand-dark p-6 rounded-2xl border border-brand-primary/20 w-full max-w-md space-y-4">
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase mb-1">Team Login Email</p>
                                        <p className="text-xl font-mono font-bold text-white">{generatedData.teamEmail}</p>
                                    </div>
                                    <Separator className="bg-white/10" />
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase mb-1">Team Passkey</p>
                                        <p className="text-xl font-mono font-bold text-brand-primary tracking-widest">{generatedData.passkey}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 text-center max-w-sm">
                                    Please save these credentials. Any team member can login using these details to verify payment and manage the team.
                                </div>
                                {generatedData.scheduled && (
                                    <Alert className="bg-orange-500/10 border-orange-500/20 text-orange-300 py-3">
                                        <AlertCircle className="w-4 h-4" />
                                        <AlertDescription className="text-[10px]">
                                            Due to SMTP limits, your confirmation email has been scheduled for delivery within 24 hours. Your registration is confirmed.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-300 py-3">
                                    <Info className="w-4 h-4" />
                                    <AlertDescription className="text-[10px]">
                                        Login using the generated Team Email and Passkey above.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {step === 1 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        {isBufferMode && (
                                            <Alert className="mb-6 bg-orange-500/10 border-orange-500/20 text-orange-400">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription className="text-xs">
                                                    <strong>High Demand!</strong> We have reached our soft limit. You are submitting a <span className="underline">request for a spot</span>. Approvals are granted on a first-come, first-served basis.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                        <div className="bg-linear-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 p-6 rounded-2xl">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-dark">
                                                    <Zap className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-xl font-bold">What Awaits You!</h3>
                                            </div>

                                            <div className="space-y-4 text-gray-200">
                                                <p className="text-white font-semibold">✨ Everything You Get:</p>
                                                <ul className="space-y-2 text-sm">
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-400 mt-0.5">✅</span>
                                                        <span><strong className="text-white">24-Hour Hackathon</strong> • Build real projects, solve challenges</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-400 mt-0.5">✅</span>
                                                        <span><strong className="text-white">Snacks & Refreshments</strong> • Throughout the event</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-400 mt-0.5">✅</span>
                                                        <span><strong className="text-white">Overnight Accommodation</strong> • For hackathon night participants</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-400 mt-0.5">✅</span>
                                                        <span><strong className="text-white">High-Tech Labs</strong> • State-of-the-art workstations</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-400 mt-0.5">✅</span>
                                                        <span><strong className="text-white">Mentorship</strong> • Guidance from industry experts</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-400 mt-0.5">✅</span>
                                                        <span><strong className="text-white">60K+ Prize Pool</strong> • Win big! 🏆</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-400 mt-0.5">✅</span>
                                                        <span><strong className="text-white">Network with 500+</strong> • Meet amazing coders</span>
                                                    </li>
                                                </ul>

                                                <Separator className="bg-white/10 my-4" />

                                                <p className="text-white font-semibold">📌 What to Arrange <span className="text-gray-400">(at your own cost)</span>:</p>
                                                <ul className="space-y-2 text-sm">
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-blue-400 mt-0.5">🍽️</span>
                                                        <span><strong>Dinner:</strong> Available at college canteen or via Swiggy/Zomato</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-blue-400 mt-0.5">🏨</span>
                                                        <span><strong>Extra Accommodation:</strong> If needed beyond hackathon night, at nearby hostels</span>
                                                    </li>
                                                </ul>

                                                <div className="bg-brand-dark p-4 rounded-xl border border-white/5 flex items-center justify-between mt-4">
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Need Help?</p>
                                                        <p className="text-white font-bold font-mono">8897892720</p>
                                                    </div>
                                                    <Button size="sm" variant="outline" className="text-[10px] border-gray-800" onClick={() => window.open('tel:8897892720')}>Contact Us</Button>
                                                </div>
                                            </div>
                                        </div>

                                        <Alert className="bg-brand-primary/10 border-brand-primary/30 text-brand-primary">
                                            <Zap className="w-4 h-4" />
                                            <AlertDescription className="text-xs">
                                                <strong>Ready to vibe?</strong> Click "I Understand & Proceed" to start your registration! 🚀
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">

                                        <div className="md:col-span-2 space-y-4">
                                            <Label>Team Size (1-5)</Label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <Button
                                                        key={n}
                                                        type="button"
                                                        variant={teamSize === n ? "default" : "outline"}
                                                        className={teamSize === n ? "bg-brand-primary text-brand-dark" : "bg-brand-dark border-gray-800"}
                                                        onClick={() => handleTeamSizeChange(n)}
                                                    >
                                                        {n}
                                                    </Button>
                                                ))}
                                            </div>
                                            {teamSize > 0 && ticketType && (
                                                <Alert className="bg-brand-primary/10 border-brand-primary/20 text-brand-primary py-3 mt-4">
                                                    <Info className="h-4 w-4" />
                                                    <AlertDescription className="text-xs space-y-1">
                                                        <div className="font-semibold">Price Breakdown:</div>
                                                        <div className="flex justify-between">
                                                            <span>Base Price (per person) = ₹{calculatePricing().basePrice}</span>
                                                        </div>
                                                        {teamSize > 1 && (
                                                            <div className="flex justify-between text-green-400">
                                                                <span>Group Discount (₹10 × {teamSize - 1} per person) = ₹{calculatePricing().discountPerPerson} per person</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between">
                                                            <span>Final Price per Person = ₹{calculatePricing().perPerson}</span>
                                                        </div>
                                                        <Separator className="bg-brand-primary/20 my-1" />
                                                        <div className="flex justify-between font-bold text-sm">
                                                            <span>Total Amount ({teamSize} × ₹{calculatePricing().perPerson}) = ₹{calculatePricing().total}</span>
                                                        </div>
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        {fields.map((field, i) => (
                                            <div key={field.id} className="p-4 bg-brand-dark/50 rounded-xl border border-white/5 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-bold text-brand-primary uppercase">Member {i + 1} {i === 0 && "(Leader)"}</p>
                                                    {i > 0 && (
                                                        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={sameAsLead[i] || false}
                                                                onChange={(e) => handleSameAsLeadToggle(i, e.target.checked)}
                                                                className="w-4 h-4 rounded border-gray-600 text-brand-primary focus:ring-brand-primary focus:ring-offset-0"
                                                            />
                                                            Same as team lead
                                                        </label>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Input
                                                            placeholder="Full Name"
                                                            className={`bg-brand-dark border-gray-800 ${errors.members?.[i]?.fullName ? 'border-red-500' : ''}`}
                                                            {...control.register(`members.${i}.fullName`)}
                                                        />
                                                        {errors.members?.[i]?.fullName && <p className="text-xs text-red-400 mt-1">{errors.members?.[i]?.fullName?.message}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Input
                                                            placeholder="Email Address"
                                                            type="email"
                                                            className={`bg-brand-dark border-gray-800 ${errors.members?.[i]?.email ? 'border-red-500' : ''}`}
                                                            {...control.register(`members.${i}.email`)}
                                                        />
                                                        {errors.members?.[i]?.email && <p className="text-xs text-red-400 mt-1">{errors.members?.[i]?.email?.message}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Controller
                                                            name={`members.${i}.college`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <CreatableCombobox
                                                                    options={localColleges}
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    onCreate={handleCreateCollege}
                                                                    placeholder="Select or type College..."
                                                                    emptyText="No college found."
                                                                    className={errors.members?.[i]?.college ? 'border-red-500' : ''}
                                                                />
                                                            )}
                                                        />
                                                        {errors.members?.[i]?.college && <p className="text-xs text-red-400 mt-1">{errors.members?.[i]?.college?.message}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Controller
                                                            name={`members.${i}.city`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <CreatableCombobox
                                                                    options={localCities}
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    onCreate={handleCreateCity}
                                                                    placeholder="Select or type City..."
                                                                    emptyText="No city found."
                                                                    className={errors.members?.[i]?.city ? 'border-red-500' : ''}
                                                                />
                                                            )}
                                                        />
                                                        {errors.members?.[i]?.city && <p className="text-xs text-red-400 mt-1">{errors.members?.[i]?.city?.message}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Input
                                                            placeholder="WhatsApp Number"
                                                            className={`bg-brand-dark border-gray-800 ${errors.members?.[i]?.whatsapp ? 'border-red-500' : ''}`}
                                                            {...control.register(`members.${i}.whatsapp`)}
                                                            maxLength={10}
                                                        />
                                                        {errors.members?.[i]?.whatsapp && <p className="text-xs text-red-400 mt-1">{errors.members?.[i]?.whatsapp?.message}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Input
                                                            placeholder="Department"
                                                            className={`bg-brand-dark border-gray-800 ${errors.members?.[i]?.department ? 'border-red-500' : ''}`}
                                                            {...control.register(`members.${i}.department`)}
                                                        />
                                                        {errors.members?.[i]?.department && <p className="text-xs text-red-400 mt-1">{errors.members?.[i]?.department?.message}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Controller
                                                            name={`members.${i}.year`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <SelectTrigger className={`bg-brand-dark border-gray-800 ${errors.members?.[i]?.year ? 'border-red-500' : ''}`}>
                                                                        <SelectValue placeholder="Year *" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="1st Year">1st Year</SelectItem>
                                                                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                                                                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                                                                        <SelectItem value="4th Year">4th Year</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                        {errors.members?.[i]?.year && <p className="text-xs text-red-400 mt-1">{errors.members?.[i]?.year?.message}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        <div className="bg-brand-dark p-6 rounded-2xl border border-white/5 text-center">
                                            <p className="text-gray-400 mb-2">Total Amount to Pay</p>
                                            <p className="text-4xl font-bold text-white">₹{pricing.total}</p>
                                            <p className="text-xs text-brand-primary mt-1">₹{pricing.perPerson} per person (Group Discount Applied)</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                            <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center max-w-[200px] mx-auto overflow-hidden">
                                                <div className="relative w-full aspect-square mb-4">
                                                    <Image
                                                        src={settings?.qrImageUrl && settings.qrImageUrl !== '/payment qr.jpg' ? settings.qrImageUrl : '/payment qr.jpg'}
                                                        alt="Payment QR"
                                                        fill
                                                        className="object-contain"
                                                        unoptimized
                                                    />
                                                </div>
                                                <div className="text-black font-bold text-center w-full">
                                                    <Separator className="bg-gray-100 mb-3" />
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">UPI ID</p>
                                                    <p className="text-xs select-all text-black">{settings?.upiId || "8897892720@ybl"}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="flex justify-between">
                                                        <span>Transaction ID (UTR)</span>
                                                        <span className="text-[10px] text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        placeholder="Enter 12-digit UTR"
                                                        required
                                                        className={`bg-brand-dark border-gray-800 font-mono ${errors.transactionId ? 'border-red-500' : ''}`}
                                                        {...control.register('transactionId')}
                                                    />
                                                    {errors.transactionId && <p className="text-[10px] text-red-500">{errors.transactionId.message}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="flex justify-between">
                                                        <span>Payment Screenshot</span>
                                                        <span className="text-[10px] text-red-500">*</span>
                                                    </Label>
                                                    <div className={`relative border-2 border-dashed rounded-xl p-4 text-center hover:border-brand-primary transition-colors cursor-pointer ${errors.screenshot ? 'border-red-500 bg-red-500/5' : 'border-gray-800'}`}>
                                                        <Input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                                        {screenshotPreview ? (
                                                            <div className="relative h-16 w-full">
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
                                                                <Upload className="w-6 h-6 mx-auto text-gray-500" />
                                                                <p className="text-[10px] text-gray-400">Click to Upload</p>
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
                    </div>
                </ScrollArea>

                <div className="p-6 bg-brand-dark/50 shrink-0 mt-auto">
                    <Separator className="bg-white/5 mb-6" />
                    {isSuccess ? (
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={handleAutoLogin}
                                disabled={isAutoLoggingIn}
                                className="bg-brand-primary text-brand-dark hover:bg-brand-secondary hover:text-white w-full font-bold text-lg h-12"
                            >
                                {isAutoLoggingIn ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <LayoutDashboard className="w-5 h-5 mr-2" />
                                )}
                                Go to Dashboard
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="text-gray-400 hover:text-white h-10 w-full"
                            >
                                Close
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center w-full">
                            {step > 1 ? (
                                <Button variant="outline" onClick={() => setStep(step - 1)} className="border-gray-800">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                            ) : (
                                <div />
                            )}

                            <Button
                                onClick={(e) => (step === 4 || (isBufferMode && step === 3)) ? handleSubmit(onSubmit)(e) : nextStep()}
                                disabled={isSubmitting}
                                className="bg-brand-primary text-brand-dark font-bold hover:bg-brand-secondary hover:text-white"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        {(step === 4 || (isBufferMode && step === 3)) ? (isBufferMode ? "Submit Request" : "Complete Registration") : (step === 1 ? "I Understand & Proceed" : "Next Step")}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog >
    );
};

export default RegistrationModal;
