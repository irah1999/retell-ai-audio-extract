'use server';

import OpenAI from 'openai';

export interface AnalysisResult {
    category: string;
    score: string | number;
    feedback: string;
}

export interface FullAnalysis {
    grammar: AnalysisResult;
    fluency: AnalysisResult;
    pronunciation: AnalysisResult;
    emotion: {
        state: string;
        description: string;
    };
    overall: string;
}

export async function analyzeAudio(formData: FormData) {
    const base64Audio = formData.get('audio') as string;
    const transcript = formData.get('transcript') as string;
    const configStr = formData.get('config') as string;

    if (!configStr) throw new Error('Configuration is missing');
    const config = JSON.parse(configStr);

    if (!config.apiKey) throw new Error('API Key is missing');

    const openai = new OpenAI({ apiKey: config.apiKey });

    try {
        let text = transcript || '';

        if (!text && base64Audio) {
            console.log('Transcribing audio with Whisper...');
            const buffer = Buffer.from(base64Audio, 'base64');
            const file = await OpenAI.toFile(buffer, 'audio.mp3', { type: 'audio/mpeg' });

            const transcription = await openai.audio.transcriptions.create({
                file: file,
                model: 'whisper-1',
            });
            text = transcription.text;
            console.log('Transcription complete:', text.substring(0, 50) + '...');
        }

        console.log('Starting AI analysis with model:', config.model || 'gpt-4o');

        const prompt = `
            Analyze the following speech text for:
            1. Grammar (Quality, errors, suggestions)
            2. Fluency (Flow, pace, filler words)
            3. Pronunciation (If possible from text context, or overall articulation)
            4. Emotional tone (Good, Sad, Active, Bold, etc.)

            Return the result strictly as a JSON object matching this structure:
            {
                "grammar": { "category": "Grammar", "score": "8/10", "feedback": "..." },
                "fluency": { "category": "Fluency", "score": "7/10", "feedback": "..." },
                "pronunciation": { "category": "Pronunciation", "score": "N/A", "feedback": "Estimated based on context..." },
                "emotion": { "state": "Bold", "description": "The user sounds confident and direct." },
                "overall": "Brief summary"
            }

            Text: "${text}"
        `;

        const response = await openai.chat.completions.create({
            model: config.model || 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: config.temperature || 0.7,
            response_format: { type: 'json_object' },
        });

        return JSON.parse(response.choices[0].message.content || '{}') as FullAnalysis;
    } catch (error: any) {
        console.error('OpenAI Error:', error);
        throw new Error(error.message || 'Failed to analyze audio');
    }
}
