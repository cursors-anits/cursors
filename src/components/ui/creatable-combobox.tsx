'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface CreatableComboboxProps {
    options: string[];
    value?: string;
    onChange: (value: string) => void;
    onCreate?: (value: string) => void;
    placeholder?: string;
    emptyText?: string;
    className?: string;
}

export function CreatableCombobox({
    options,
    value,
    onChange,
    onCreate,
    placeholder = "Select option...",
    emptyText = "No results found.",
    className
}: CreatableComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value || "");

    // Update local input if parent value changes
    React.useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(inputValue.toLowerCase())
    );

    const handleBlur = () => {
        // If we have a value and it's not in the options (exact match), trigger creation
        // We defer this slightly to allow click events on the list to fire first
        setTimeout(() => {
            const exactMatch = options.some(opt => opt.toLowerCase() === inputValue.trim().toLowerCase());
            if (inputValue.trim() && !exactMatch && onCreate) {
                onCreate(inputValue.trim());
            }
            setOpen(false);
        }, 200);
    };

    const handleSelect = (option: string) => {
        setInputValue(option);
        onChange(option);
        setOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue); // Update parent immediately as free text
        setOpen(true);
    };

    return (
        <Popover open={open && filteredOptions.length > 0 && inputValue.length > 0} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="relative w-full">
                    <Input
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        onFocus={() => setOpen(inputValue.length > 0)}
                        placeholder={placeholder}
                        className={cn("w-full bg-brand-dark border-gray-800", className)}
                        autoComplete="off"
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0 bg-brand-surface border-white/10 text-white"
                onOpenAutoFocus={(e) => e.preventDefault()}
                align="start"
            >
                <Command className="bg-brand-surface text-white w-full">
                    <CommandList className="max-h-[200px] overflow-y-auto w-full">
                        <CommandGroup className="p-0">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <CommandItem
                                        key={option}
                                        value={option}
                                        onSelect={() => handleSelect(option)}
                                        className="text-white aria-selected:bg-white/10 cursor-pointer px-4 py-2 whitespace-normal break-all h-auto"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 shrink-0",
                                                inputValue === option ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span>{option}</span>
                                    </CommandItem>
                                ))
                            ) : (
                                inputValue.trim() ? (
                                    <div className="py-3 px-4 text-sm text-gray-400 text-center">
                                        <p>Your college is also welcome!</p>
                                        <p className="text-xs mt-1 text-gray-500">From next registration, this will be added to the list.</p>
                                    </div>
                                ) : (
                                    <CommandItem value="no-results" className="text-gray-500 cursor-default" disabled>
                                        {emptyText}
                                    </CommandItem>
                                )
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
