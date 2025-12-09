"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, Loader2 } from "lucide-react"

interface FileUploadZoneProps {
    onFileSelect: (file: File) => void
    isAnalyzing: boolean
}

export function FileUploadZone({ onFileSelect, isAnalyzing }: FileUploadZoneProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0])
        }
    }, [onFileSelect])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: false,
        disabled: isAnalyzing
    })

    return (
        <Card>
            <CardContent className="p-8">
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                        } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}`}
                >
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center gap-4">
                        {isAnalyzing ? (
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                        ) : (
                            <Upload className="h-16 w-16 text-muted-foreground" />
                        )}

                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">
                                {isAnalyzing ? 'Analyzing Document...' : 'Upload Document'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {isAnalyzing
                                    ? 'Please wait while we analyze your document'
                                    : 'Drag and drop your file here, or click to browse'
                                }
                            </p>
                        </div>

                        {!isAnalyzing && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span>Supports: DOCX, TXT (Max 5MB)</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
