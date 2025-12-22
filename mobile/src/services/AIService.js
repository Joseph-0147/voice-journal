import axios from 'axios';

// API Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-api-key-here';
const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';

/**
 * AI Service for Echo App
 * Handles transcription and analysis of audio journal entries using OpenAI APIs
 */

class AIService {
  constructor() {
    this.apiKey = OPENAI_API_KEY;
    this.baseURL = OPENAI_API_BASE_URL;
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   * @param {string} audioFilePath - Path or URL to the audio file
   * @param {string} language - Optional language code (e.g., 'en')
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeAudio(audioFilePath, language = 'en') {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audioFilePath,
        type: 'audio/m4a',
        name: 'recording.m4a',
      });
      formData.append('model', 'whisper-1');
      
      if (language) {
        formData.append('language', language);
      }

      // Optional: Add timestamps for milestone detection
      formData.append('timestamp_granularities[]', 'word');
      formData.append('response_format', 'verbose_json');

      const response = await axios.post(
        `${this.baseURL}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        transcript: response.data.text,
        words: response.data.words || [], // Word-level timestamps
        duration: response.data.duration,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Transcription failed',
      };
    }
  }

  /**
   * Analyze journal entry transcript using GPT-4
   * Extracts action items, milestones, sentiment, and themes
   * @param {string} transcript - The transcribed text
   * @param {Array} wordTimestamps - Optional word-level timestamps
   * @returns {Promise<Object>} Analysis result with structured data
   */
  async analyzeJournalEntry(transcript, wordTimestamps = []) {
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

      // Enhance milestones with timestamps if available
      if (wordTimestamps.length > 0) {
        analysis.audioMilestones = this.addTimestampsToMilestones(
          analysis.audioMilestones,
          transcript,
          wordTimestamps
        );
      }

      return {
        success: true,
        analysis,
      };
    } catch (error) {
      console.error('Analysis error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Analysis failed',
      };
    }
  }

  /**
   * Build the analysis prompt for GPT-4
   * @param {string} transcript - The journal entry transcript
   * @returns {string} Formatted prompt
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
   * Add timestamps to milestones based on word-level timestamps
   * @param {Array} milestones - Milestones from analysis
   * @param {string} transcript - Full transcript
   * @param {Array} wordTimestamps - Word-level timestamp data
   * @returns {Array} Milestones with timestamp information
   */
  addTimestampsToMilestones(milestones, transcript, wordTimestamps) {
    return milestones.map((milestone) => {
      const excerpt = milestone.excerpt.toLowerCase();
      const excerptWords = excerpt.split(' ');
      
      // Find the position of the excerpt in the word timestamps
      let bestMatch = null;
      let bestMatchScore = 0;

      for (let i = 0; i < wordTimestamps.length - excerptWords.length; i++) {
        const windowWords = wordTimestamps
          .slice(i, i + excerptWords.length)
          .map(w => w.word.toLowerCase());
        
        const matchScore = this.calculateMatchScore(excerptWords, windowWords);
        
        if (matchScore > bestMatchScore) {
          bestMatchScore = matchScore;
          bestMatch = wordTimestamps[i];
        }
      }

      return {
        ...milestone,
        timestamp: bestMatch ? this.formatTimestamp(bestMatch.start) : '0:00',
        timestampSeconds: bestMatch ? bestMatch.start : 0,
      };
    });
  }

  /**
   * Calculate match score between two word arrays
   */
  calculateMatchScore(words1, words2) {
    let matches = 0;
    const minLength = Math.min(words1.length, words2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (words1[i] === words2[i]) {
        matches++;
      }
    }
    
    return matches / words1.length;
  }

  /**
   * Format timestamp from seconds to MM:SS
   */
  formatTimestamp(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Process complete audio journal entry
   * Combines transcription and analysis
   * @param {string} audioFilePath - Path to audio file
   * @param {Object} options - Optional parameters
   * @returns {Promise<Object>} Complete analysis result
   */
  async processJournalEntry(audioFilePath, options = {}) {
    try {
      // Step 1: Transcribe audio
      console.log('Transcribing audio...');
      const transcriptionResult = await this.transcribeAudio(
        audioFilePath,
        options.language
      );

      if (!transcriptionResult.success) {
        return {
          success: false,
          error: 'Transcription failed',
          details: transcriptionResult.error,
        };
      }

      // Step 2: Analyze transcript
      console.log('Analyzing transcript...');
      const analysisResult = await this.analyzeJournalEntry(
        transcriptionResult.transcript,
        transcriptionResult.words
      );

      if (!analysisResult.success) {
        return {
          success: false,
          error: 'Analysis failed',
          details: analysisResult.error,
          transcript: transcriptionResult.transcript, // Still return transcript
        };
      }

      // Return combined result
      return {
        success: true,
        transcript: transcriptionResult.transcript,
        duration: transcriptionResult.duration,
        analysis: analysisResult.analysis,
      };
    } catch (error) {
      console.error('Processing error:', error);
      return {
        success: false,
        error: 'Processing failed',
        details: error.message,
      };
    }
  }
}

// Export singleton instance
export default new AIService();

// Export class for testing
export { AIService };
