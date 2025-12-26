import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';

interface FileUploadFieldProps {
    label: string;
    sublabel?: string;
    accept?: string;
    file: File | null;
    onFileChange: (file: File | null) => void;
    required?: boolean;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
    label,
    sublabel,
    accept,
    file,
    onFileChange,
    required = false
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileChange(e.target.files[0]);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label className="text-gray-300">
                    {label} {required && <span className="text-brand-primary">*</span>}
                </Label>
                {file && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready to upload
                    </span>
                )}
            </div>

            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept={accept}
                onChange={handleFileChange}
            />

            {!file ? (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => inputRef.current?.click()}
                    className="w-full h-24 border-dashed border-white/20 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-2 group"
                >
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-brand-primary transition-colors" />
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                        Click to upload {label}
                    </span>
                    {sublabel && (
                        <span className="text-xs text-gray-600">{sublabel}</span>
                    )}
                </Button>
            ) : (
                <div className="flex items-center justify-between p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-lg group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-brand-primary/20 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-brand-primary" />
                        </div>
                        <div className="text-sm">
                            <div className="text-white font-medium truncate max-w-[200px]">{file.name}</div>
                            <div className="text-xs text-brand-primary/80">{(file.size / 1024).toFixed(1)} KB</div>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            onFileChange(null);
                            if (inputRef.current) inputRef.current.value = '';
                        }}
                        className="hover:bg-red-500/20 hover:text-red-400 text-gray-400"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};
