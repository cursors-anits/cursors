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
    LayoutDashboard
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    const [isSuccess, setIsSuccess] = useState(false);
    const [generatedData, setGeneratedData] = useState<{ teamId: string, teamEmail: string, passkey: string } | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
    const router = useRouter();
    const { setCurrentUser } = useData();

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors, isSubmitting },
        reset
    } = useForm<IFormData>({
        resolver: zodResolver(RegistrationSchema),
        defaultValues: {
            college: '',
            city: '',
            ticketType: 'combo',
            teamSize: 1,
            members: [{ fullName: '', email: '', department: '', whatsapp: '', year: '3rd Year' }],
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
        if (!isOpen) {
            setStep(1);
            setIsSuccess(false);
            reset();
            setGeneratedData(null);
            setScreenshotPreview(null);
        }
    }, [isOpen, reset]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
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
                append({ fullName: '', email: '', department: '', whatsapp: '', year: '3rd Year' });
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
        const discount = (teamSize - 1) * 10;
        const pricePerPerson = basePrice - discount;
        return {
            total: pricePerPerson * teamSize,
            perPerson: pricePerPerson
        };
    };

    const nextStep = async () => {
        let fieldsToValidate: (keyof IFormData)[] = [];
        if (step === 1) fieldsToValidate = ['college', 'city', 'ticketType', 'teamSize'];
        if (step === 2) fieldsToValidate = ['members'];

        const isValid = await trigger(fieldsToValidate);
        if (isValid) setStep(step + 1);
        else toast.error('Please correct the errors before proceeding');
    };

    const onSubmit = async (data: IFormData) => {
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Registration failed');

            setGeneratedData({
                teamId: result.teamId,
                teamEmail: result.teamEmail,
                passkey: result.passkey
            });
            setIsSuccess(true);
            toast.success('Registration successful!');
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
                    password: generatedData.passkey,
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
                                {isSuccess ? "Welcome to Vibe Coding 2026" : `Step ${step} of 3 • Registration`}
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
                            <div className="bg-brand-dark p-6 rounded-2xl border border-brand-primary/20 w-full max-w-md space-y-4">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase mb-1">Team Login Email</p>
                                    <p className="text-2xl font-mono font-bold text-white">{generatedData.teamEmail}</p>
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    <p className="text-gray-400 text-xs uppercase mb-1">Team Passkey</p>
                                    <p className="text-2xl font-mono font-bold text-brand-primary tracking-widest">{generatedData.passkey}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-400 text-center max-w-sm">
                                Please save these credentials. Any team member can login using these details to verify payment and manage the team.
                            </div>
                            <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-300">
                                <Info className="w-4 h-4" />
                                <AlertDescription>
                                    Login using the generated Team Email and Passkey above.
                                </AlertDescription>
                            </Alert>
                            <Button onClick={handleAutoLogin} disabled={isAutoLoggingIn} className="bg-brand-primary text-brand-dark hover:bg-brand-secondary hover:text-white w-full max-w-md font-bold text-lg h-12">
                                {isAutoLoggingIn ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <LayoutDashboard className="w-5 h-5 mr-2" />}
                                Go to Dashboard
                            </Button>
                            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
                                Close
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {step === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                                    <div className="space-y-4 md:col-span-2">
                                        <Label>College / University</Label>
                                        <Controller
                                            name="college"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className={`bg-brand-dark border-gray-800 ${errors.college ? 'border-red-500' : ''}`}>
                                                        <SelectValue placeholder="Select College" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {COLLEGES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.college && <p className="text-xs text-red-500">{errors.college.message}</p>}
                                    </div>
                                    <div className="space-y-4">
                                        <Label>City</Label>
                                        <Controller
                                            name="city"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className={`bg-brand-dark border-gray-800 ${errors.city ? 'border-red-500' : ''}`}>
                                                        <SelectValue placeholder="Select City" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                                    </div>
                                    <div className="space-y-4">
                                        <Label>Ticket Type</Label>
                                        <Controller
                                            name="ticketType"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="bg-brand-dark border-gray-800">
                                                        <SelectValue placeholder="Select Pass" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="workshop">Workshop (₹199)</SelectItem>
                                                        <SelectItem value="hackathon">Hackathon (₹349)</SelectItem>
                                                        <SelectItem value="combo">Combo Pass (₹499)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
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
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    {fields.map((field, i) => (
                                        <div key={field.id} className="p-4 bg-brand-dark/50 rounded-xl border border-white/5 space-y-4">
                                            <p className="text-xs font-bold text-brand-primary uppercase">Member {i + 1} {i === 0 && "(Leader)"}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Input
                                                        placeholder="Full Name"
                                                        className={`bg-brand-dark border-gray-800 ${errors.members?.[i]?.fullName ? 'border-red-500' : ''}`}
                                                        {...control.register(`members.${i}.fullName`)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Input
                                                        placeholder="Email Address"
                                                        type="email"
                                                        className={`bg-brand-dark border-gray-800 ${errors.members?.[i]?.email ? 'border-red-500' : ''}`}
                                                        {...control.register(`members.${i}.email`)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Input
                                                        placeholder="WhatsApp Number"
                                                        className={`bg-brand-dark border-gray-800 ${errors.members?.[i]?.whatsapp ? 'border-red-500' : ''}`}
                                                        {...control.register(`members.${i}.whatsapp`)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Input
                                                        placeholder="Department"
                                                        className={`bg-brand-dark border-gray-800 ${errors.members?.[i]?.department ? 'border-red-500' : ''}`}
                                                        {...control.register(`members.${i}.department`)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Controller
                                                        name={`members.${i}.year`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select onValueChange={field.onChange} value={field.value}>
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
                                                        )}
                                                    />
                                                </div>
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
                                                    className={`bg-brand-dark border-gray-800 font-mono ${errors.transactionId ? 'border-red-500' : ''}`}
                                                    {...control.register('transactionId')}
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
                            onClick={(e) => step === 3 ? handleSubmit(onSubmit)(e) : nextStep()}
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
