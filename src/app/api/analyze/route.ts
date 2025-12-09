import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { extractText, getDocumentStats } from "@/lib/extractText"
import { analyzeDocument } from "@/lib/openai"
import { canAnalyzeFile, incrementUsage } from "@/lib/usageChecker"

export async function POST(request: Request) {
    const supabase = await createClient()

    // Verify Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check file analysis limit
    const usageStatus = await canAnalyzeFile(user.id)

    if (!usageStatus.allowed) {
        return NextResponse.json({
            error: "Monthly file analysis limit reached",
            message: `You've analyzed ${usageStatus.current} of ${usageStatus.limit} files this month. Please upgrade your plan to continue.`,
            limit: usageStatus.limit,
            used: usageStatus.current,
            planName: usageStatus.planName
        }, { status: 403 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
        }

        // Validate file type - DOCX and TXT only
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ]

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                error: "Invalid file type. Only DOCX and TXT files are allowed."
            }, { status: 400 })
        }

        // Extract text from document
        const text = await extractText(file)

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "No text found in document" }, { status: 400 })
        }

        // Get document statistics
        const stats = getDocumentStats(text)

        // Analyze with OpenAI
        const analysis = await analyzeDocument(text)

        // Save to database
        const { data: savedAnalysis, error: dbError } = await supabase
            .from('document_analyses')
            .insert([{
                user_id: user.id,
                filename: file.name,
                file_type: file.type,
                file_size: file.size,
                word_count: stats.words,
                char_count: stats.characters,
                summary: analysis.summary,
                keywords: analysis.keywords,
                key_points: analysis.keyPoints,
                action_items: analysis.actionItems
            }])
            .select()
            .single()

        if (dbError) {
            console.error('Database error:', dbError)
            // Still return analysis even if DB save fails
        }

        // Increment usage counter after successful analysis
        await incrementUsage(user.id)

        return NextResponse.json({
            filename: file.name,
            stats,
            analysis,
            savedId: savedAnalysis?.id,
            usage: {
                current: usageStatus.current + 1,
                limit: usageStatus.limit
            }
        })

    } catch (error: any) {
        console.error('Analysis error:', error)
        return NextResponse.json({
            error: error.message || "Failed to analyze document"
        }, { status: 500 })
    }
}
