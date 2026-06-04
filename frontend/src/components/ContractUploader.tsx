"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";

interface ContractUploaderProps {
    sourceCode: string;
    setSourceCode: (code: string) => void;
}

export function ContractUploader({ sourceCode, setSourceCode }: ContractUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const processFile = (file: File) => {
        if (!file.name.endsWith('.sol')) {
            alert('Please upload a valid Solidity (.sol) file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setSourceCode(e.target.result as string);
            }
        };
        reader.readAsText(file);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h3 className="text-headline-sm font-bold text-on-surface">Smart Contract Source</h3>
                    <p className="text-body-md text-on-surface-variant">Paste your Solidity code below, or drag and drop a .sol file.</p>
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-label-md bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface py-2 px-4 rounded border border-outline-variant w-max"
                >
                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                    Upload .sol
                </button>
                <input 
                    type="file" 
                    accept=".sol" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                />
            </div>

            <div 
                className={`relative w-full rounded-lg overflow-hidden border-2 transition-colors ${
                    isDragging ? 'border-primary bg-primary/5' : 'border-outline-variant focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <textarea
                    value={sourceCode}
                    onChange={(e) => setSourceCode(e.target.value)}
                    placeholder={`// Paste your solidity smart contract here...\npragma solidity ^0.8.0;\n\ncontract MyVault {\n    // ...\n}`}
                    className="w-full h-96 bg-surface-container-lowest text-on-surface font-label-md p-4 resize-y focus:outline-none placeholder-on-surface-variant/40 leading-relaxed"
                    spellCheck={false}
                />
                
                {isDragging && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
                        <span className="material-symbols-outlined text-primary text-4xl mb-2 animate-bounce">
                            cloud_download
                        </span>
                        <p className="text-primary font-bold text-headline-sm">Drop .sol file here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
