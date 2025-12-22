const axios = require('axios');
const FormData = require('form-data');

/**
 * OpenAI Service for Echo Backend
 * Handles transcription and analysis using OpenAI APIs
 */

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  /**
   * Transcribe audio file using Whisper API
   */
  async transcribeAudio(audioBuffer, filename) {
    try {
      const formData = new FormData();
      formData.append('file', audioBuffer, filename);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      formData.append('timestamp_granularities[]', 'word');
      formData.append('response_format', 'verbose_json');

      const response = await axios.post(
        `${this.baseURL}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            ...formData.getHeaders(),
          },
        }
      );

      return {
        success: true,
        transcript: response.data.text,
        words: response.data.words || [],
        duration: response.data.duration,
      };
    } catch (error) {
      console.error('Transcription error:', error.response?.data || error.message);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Analyze journal transcript using GPT-4
   */
  async analyzeJournalEntry(transcript) {
    try {
      const prompt = this.buildAnalysisPrompt(transcript);

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant specialized in analyzing personal journal entries. You help users extract actionable insights, identify key moments, and understand emotional patterns in their reflections. Always respond with valid JSON in the exact format requested.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const analysis = JSON.parse(response.data.choices[0].message.content);

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
