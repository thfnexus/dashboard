// Using dynamic imports for file parsing

/**
 * Extract text from different file types - SERVER SIDE ONLY
 */
export async function extractText(file: File): Promise<string> {
    const fileType = file.type
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
        if (fileType === 'application/pdf') {
            // For PDF files, we'll use a simpler approach
            // In production, consider using a proper PDF library or external service
            throw new Error('PDF parsing not available in this environment. Please use TXT or DOCX files.')
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // Extract from DOCX
            const mammoth = (await import('mammoth')).default
            const result = await mammoth.extractRawText({ buffer })
            return result.value
        } else if (fileType === 'text/plain') {
            // Extract from TXT
            return buffer.toString('utf-8')
        } else {
            throw new Error('Unsupported file type')
        }
    } catch (error) {
        console.error('Text extraction error:', error)
        throw error
    }
}

/**
 * Get document statistics
 */
export function getDocumentStats(text: string) {
    const words = text.trim().split(/\s+/).length
    const characters = text.length
    const lines = text.split('\n').length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length

    return {
        words,
        characters,
        lines,
        paragraphs
    }
}
