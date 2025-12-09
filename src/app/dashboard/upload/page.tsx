"use client"

import { useState } from "react"
import { FileUploadZone } from "@/components/analyzer/FileUploadZone"
import { AnalysisResults } from "@/components/analyzer/AnalysisResults"
import { UsageIndicator } from "@/components/plans/UsageIndicator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function UploadPage() {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<any>(null)
    const [error, setError] = useState<string>("")

    const handleFileSelect = async (file: File) => {
        setError("")
        setIsAnalyzing(true)
        setAnalysisResult(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || errorData.error || 'Analysis failed')
            }

            const data = await res.json()
            setAnalysisResult(data)
        } catch (err: any) {
            setError(err.message || 'Failed to analyze document')
            console.error(err)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleReset = () => {
        setAnalysisResult(null)
        setError("")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AI Document Analyzer</h2>
                    <p className="text-muted-foreground">
                        Upload documents and get AI-powered insights
                    </p>
                </div>
                {analysisResult && (
                    <Button onClick={handleReset} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Analyze Another
                    </Button>
                )}
            </div>

            {/* Usage Indicator */}
            <UsageIndicator />

            {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {!analysisResult ? (
                <FileUploadZone
                    onFileSelect={handleFileSelect}
                    isAnalyzing={isAnalyzing}
                />
            ) : (
                <AnalysisResults
                    filename={analysisResult.filename}
                    stats={analysisResult.stats}
                    analysis={analysisResult.analysis}
                />
            )}
        </div>
    )
}
