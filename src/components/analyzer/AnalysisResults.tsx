"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Hash, Type, FileType, Lightbulb, CheckSquare } from "lucide-react"

interface AnalysisResultsProps {
    filename: string
    stats: {
        words: number
        characters: number
        lines: number
        paragraphs: number
    }
    analysis: {
        summary: string
        keywords: string[]
        keyPoints: string[]
        actionItems: string[]
    }
}

export function AnalysisResults({ filename, stats, analysis }: AnalysisResultsProps) {
    return (
        <div className="space-y-6">
            {/* File Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {filename}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Hash className="h-4 w-4" />
                                Words
                            </div>
                            <div className="text-2xl font-bold">{stats.words.toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Type className="h-4 w-4" />
                                Characters
                            </div>
                            <div className="text-2xl font-bold">{stats.characters.toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileType className="h-4 w-4" />
                                Lines
                            </div>
                            <div className="text-2xl font-bold">{stats.lines.toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                Paragraphs
                            </div>
                            <div className="text-2xl font-bold">{stats.paragraphs.toLocaleString()}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                    <CardDescription>AI-generated document summary</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm leading-relaxed">{analysis.summary}</p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Keywords */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Hash className="h-5 w-5" />
                            Keywords
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {analysis.keywords.map((keyword, index) => (
                                <Badge key={index} variant="secondary">
                                    {keyword}
                                </Badge>
                            ))}
                            {analysis.keywords.length === 0 && (
                                <p className="text-sm text-muted-foreground">No keywords identified</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Key Points */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5" />
                            Key Points
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px]">
                            <ul className="space-y-2">
                                {analysis.keyPoints.map((point, index) => (
                                    <li key={index} className="text-sm flex items-start gap-2">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                                {analysis.keyPoints.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No key points identified</p>
                                )}
                            </ul>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Action Items */}
            {analysis.actionItems.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckSquare className="h-5 w-5" />
                            Action Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {analysis.actionItems.map((item, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                    <CheckSquare className="h-4 w-4 text-primary mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
