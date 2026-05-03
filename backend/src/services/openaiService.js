const axios = require('axios');
const path = require('path');

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
const GEMINI_AUDIO_MODEL = process.env.GEMINI_AUDIO_MODEL || GEMINI_TEXT_MODEL;

/**
 * AI Service for Echo Backend
 * Handles transcription and analysis using Gemini APIs
 */

class OpenAIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseURL = GEMINI_API_BASE_URL;
  }

  getJournalAnalysisSchema() {
    return {
      type: 'object',
      additionalProperties: false,
      required: ['actionItems', 'audioMilestones', 'sentiment', 'themes', 'summary'],
      properties: {
        actionItems: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['task', 'priority', 'context'],
            properties: {
              task: { type: 'string' },
              priority: { type: 'string', enum: ['high', 'medium', 'low'] },
              context: { type: 'string' },
            },
          },
        },
        audioMilestones: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['type', 'description', 'excerpt', 'significance'],
            properties: {
              type: { type: 'string', enum: ['insight', 'goal', 'emotion'] },
              description: { type: 'string' },
              excerpt: { type: 'string' },
              significance: { type: 'string' },
            },
          },
        },
        sentiment: {
          type: 'object',
          additionalProperties: false,
          required: ['overall', 'confidence', 'emotionalTone'],
          properties: {
            overall: { type: 'string', enum: ['positive', 'negative', 'neutral', 'mixed'] },
            confidence: { type: 'number', minimum: 0, maximum: 1 },
            emotionalTone: { type: 'string' },
          },
        },
        themes: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'relevance', 'keywords'],
            properties: {
              name: { type: 'string' },
              relevance: { type: 'number', minimum: 0, maximum: 1 },
              keywords: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
        summary: { type: 'string' },
      },
    };
  }

  extractJson(text) {
    if (!text) {
      return null;
    }

    const trimmed = text.trim();
    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

    if (fencedMatch) {
      return fencedMatch[1].trim();
    }

    const startIndex = trimmed.indexOf('{');
    const endIndex = trimmed.lastIndexOf('}');

    if (startIndex >= 0 && endIndex > startIndex) {
      return trimmed.slice(startIndex, endIndex + 1);
    }

    return trimmed;
  }

  getGeminiUrl(modelPath) {
    return `${this.baseURL}${modelPath}?key=${this.apiKey}`;
  }

  getMimeType(filename) {
    const extension = path.extname(filename).toLowerCase();

    if (extension === '.mp3') return 'audio/mpeg';
    if (extension === '.wav') return 'audio/wav';
    if (extension === '.aac') return 'audio/aac';
    if (extension === '.mp4') return 'audio/mp4';
    if (extension === '.webm') return 'audio/webm';

    return 'audio/m4a';
  }

  /**
   * Transcribe audio file using Gemini
   */
  async transcribeAudio(audioBuffer, filename) {
    try {
      const response = await axios.post(this.getGeminiUrl(`/models/${GEMINI_AUDIO_MODEL}:generateContent`), {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: 'Transcribe this audio journal entry verbatim. Return only the transcript text.',
              },
              {
                inlineData: {
                  mimeType: this.getMimeType(filename),
                  data: Buffer.from(audioBuffer).toString('base64'),
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
        },
      });

      const transcript = response.data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        .join('')
        .trim();

      if (!transcript) {
        throw new Error('Gemini did not return a transcript');
      }

      return {
        success: true,
        transcript,
        words: [],
        duration: null,
      };
    } catch (error) {
      console.error('Transcription error:', error.response?.data || error.message);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Analyze journal transcript using Gemini
   */
  async analyzeJournalEntry(transcript) {
    try {
      const prompt = this.buildAnalysisPrompt(transcript);

      const response = await axios.post(this.getGeminiUrl(`/models/${GEMINI_TEXT_MODEL}:generateContent`), {
        systemInstruction: {
          parts: [
            {
              text: 'You are an AI assistant specialized in analyzing personal journal entries. You help users extract actionable insights, identify key moments, and understand emotional patterns in their reflections. Always respond with valid JSON in the exact format requested.',
            },
          ],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
          responseMimeType: 'application/json',
          responseSchema: this.getJournalAnalysisSchema(),
        },
      });

      const analysisText = response.data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        .join('')
        .trim();

      if (!analysisText) {
        throw new Error('Gemini did not return analysis output');
      }

      let analysis;

      try {
        analysis = JSON.parse(analysisText);
      } catch (parseError) {
        const extractedJson = this.extractJson(analysisText);

        if (!extractedJson) {
          throw parseError;
        }

        analysis = JSON.parse(extractedJson);
      }

      return {
        success: true,
        analysis,
      };
    } catch (error) {
      console.error('Analysis error:', error.response?.data || error.message);
      throw new Error('Failed to analyze transcript');
    }
  }

  /**
   * Build the analysis prompt
   */
  buildAnalysisPrompt(transcript) {
    return `Analyze the following personal journal entry transcript and provide structured insights in JSON format.

Journal Entry Transcript:
"${transcript}"

Please analyze this entry and return a JSON object with the following structure:

{
  "actionItems": [
    {
      "task": "string - the actionable task mentioned",
      "priority": "string - high, medium, or low",
      "context": "string - relevant context or notes"
    }
  ],
  "audioMilestones": [
    {
      "type": "string - insight, goal, or emotion",
      "description": "string - brief summary of the milestone",
      "excerpt": "string - relevant quote from the transcript (keep it short, 10-20 words)",
      "significance": "string - why this moment is important"
    }
  ],
  "sentiment": {
    "overall": "string - positive, negative, neutral, or mixed",
    "confidence": "number - 0 to 1",
    "emotionalTone": "string - describe the emotional tone in 2-3 words"
  },
  "themes": [
    {
      "name": "string - theme name (e.g., work, relationships, health)",
      "relevance": "number - 0 to 1, how prominent this theme is",
      "keywords": ["array of relevant keywords"]
    }
  ],
  "summary": "string - a one-sentence summary of the entry"
}

Guidelines:
1. **Action Items**: Only extract clear, actionable tasks. Don't create tasks if none are mentioned.
2. **Audio Milestones**: Identify moments of insight (💡), goal-setting (🎯), or strong emotion (❤️). Limit to 3-5 most significant moments.
3. **Sentiment**: Be nuanced in your analysis. Consider subtle emotions and mixed feelings.
4. **Themes**: Categorize into common life areas. Limit to top 3-5 themes.
5. **Summary**: Capture the essence in one clear sentence.
6. **Excerpts**: Keep quotes brief and impactful. They should be exact quotes from the transcript.

Return ONLY the JSON object, no additional text or markdown formatting.`;
  }

  /**
   * Process complete journal entry (transcribe + analyze)
   */
  async processJournalEntry(audioBuffer, filename) {
    try {
      if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here') {
        throw new Error('Gemini API key is not configured');
      }

      // Step 1: Transcribe
      const transcriptionResult = await this.transcribeAudio(audioBuffer, filename);

      // Step 2: Analyze
      const analysisResult = await this.analyzeJournalEntry(transcriptionResult.transcript);

      return {
        success: true,
        transcript: transcriptionResult.transcript,
        duration: transcriptionResult.duration,
        analysis: analysisResult.analysis,
      };
    } catch (error) {
      console.error('Processing error:', error);
      throw error;
    }
  }
}

module.exports = new OpenAIService();
