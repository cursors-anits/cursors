import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, FileArchive, X } from 'lucide-react';

interface MultiFileUploadProps {
    label: string;
    sublabel?: string;
    accept?: string;
    files: File[];
    onFilesChange: (files: File[]) => void;
    maxFiles?: number;
}

export const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
    label,
    sublabel,
    accept,
    files,
    onFilesChange,
    maxFiles = 5
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const combinedFiles = [...files, ...newFiles].slice(0, maxFiles);
            onFilesChange(combinedFiles);
        }
    };

    const removeFile = (index: number) => {
        onFilesChange(files.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label className="text-gray-300">{label}</Label>
                <span className="text-xs text-gray-500">{files.length}/{maxFiles} files</span>
            </div>

            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept={accept}
                multiple
                onChange={handleFileChange}
            />

            <div className="grid grid-cols-1 gap-2">
                {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <FileArchive className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="text-sm truncate text-gray-300">{file.name}</div>
                            <span className="text-xs text-gray-500 shrink-0">
                                {(file.size / 1024).toFixed(1)} KB
                            </span>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-red-500/20 hover:text-red-400 text-gray-500"
                            onClick={() => removeFile(index)}
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                ))}

                {files.length < maxFiles && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => inputRef.current?.click()}
                        className="w-full h-12 border-dashed border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2"
                    >
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Add File</span>
                    </Button>
                )}
            </div>
            {sublabel && (
                <p className="text-xs text-gray-500">{sublabel}</p>
            )}
        </div>
    );
};
