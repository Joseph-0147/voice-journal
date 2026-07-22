import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Brain,
  Loader2,
  MessageSquare,
  Sparkles,
  Wand2,
} from 'lucide-react';
import toast from 'react-hot-toast';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

interface JournalEntry {
  id: string;
  tagline?: string;
  transcript?: string;
  createdAt: string;
  analysis?: {
    mood?: string;
    themes?: string[];
  };
}

type PuterChatChunk = { text?: string };

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (
          prompt: string,
          options?: { model?: string; stream?: boolean }
        ) => Promise<AsyncIterable<PuterChatChunk>> | Promise<PuterChatChunk>;
      };
    };
  }
}

const SUGGESTED_PROMPTS = [
  'Summarize my last 3 journal entries.',
  'What emotional patterns do you see in my recent entries?',
  'Turn my latest journal note into 3 actionable next steps.',
  'Give me a supportive reflection based on my recent writing.',
];

function buildJournalContext(entries: JournalEntry[]) {
  if (!entries.length) {
    return 'No recent journal entries are available yet.';
  }

  return entries
    .slice(0, 5)
    .map((entry, index) => {
      const parts = [
        `Entry ${index + 1} (${new Date(entry.createdAt).toLocaleDateString()}):`,
        entry.tagline ? `Title: ${entry.tagline}` : null,
        entry.transcript ? `Transcript: ${entry.transcript}` : null,
        entry.analysis?.mood ? `Mood: ${entry.analysis.mood}` : null,
        entry.analysis?.themes?.length
          ? `Themes: ${entry.analysis.themes.join(', ')}`
          : null,
      ].filter(Boolean);

      return parts.join('\n');
    })
    .join('\n\n');
}

export default function AssistantPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isPuterReady, setIsPuterReady] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Ask me to summarize your journal, surface patterns, or turn your thoughts into practical next steps.',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const { data: entriesData } = useQuery({
    queryKey: ['assistantEntries'],
    queryFn: async () => {
      const response = await apiClient.get('/journals?limit=20');
      return response.data.entries || [];
    },
    enabled: !!token,
  });

  const journalContext = useMemo(
    () => buildJournalContext((entriesData || []) as JournalEntry[]),
    [entriesData]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!token) return null;

  const handleSubmit = async (promptText?: string) => {
    const userMessage = (promptText || inputValue).trim();

    if (!userMessage || isSending) {
      return;
    }

    if (!window.puter?.ai) {
      toast.error('Puter.js has not loaded yet. Try again in a moment.');
      return;
    }

    const assistantMessageId = `assistant-${Date.now()}`;
    const prompt = [
      'You are Echo AI, a calm and practical journaling assistant.',
      'Use the journal context below when it is relevant, but still answer naturally if the user is asking a general question.',
      'Keep responses supportive, concise, and actionable.',
      '',
      'Journal context:',
      journalContext,
      '',
      `User request: ${userMessage}`,
    ].join('\n');

    setIsSending(true);
    setInputValue('');
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', content: userMessage },
      { id: assistantMessageId, role: 'assistant', content: '' },
    ]);

    try {
      const response = await window.puter.ai.chat(prompt, {
        model: 'gpt-5.4-nano',
        stream: true,
      });

      let assistantText = '';

      if (Symbol.asyncIterator in Object(response)) {
        for await (const part of response as AsyncIterable<PuterChatChunk>) {
          assistantText += part?.text || '';
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessageId
                ? { ...message, content: assistantText }
                : message
            )
          );
        }
      } else {
        const finalResponse = (await response) as PuterChatChunk;
        assistantText = finalResponse?.text || '';
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: assistantText }
              : message
          )
        );
      }
    } catch (error) {
      setMessages((current) => current.filter((message) => message.id !== assistantMessageId));
      toast.error('AI response failed. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Head>
        <title>AI Assistant - Echo</title>
      </Head>

      <Script
        src="https://js.puter.com/v2/"
        strategy="afterInteractive"
        onLoad={() => setIsPuterReady(true)}
      />

      <DashboardLayout>
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 lg:grid lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-background-secondary via-background-secondary to-primary/5 p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  Powered by Puter.js
                </div>
                <h1 className="text-3xl font-bold text-text-primary">
                  Echo AI Assistant
                </h1>
                <p className="mt-2 max-w-2xl text-text-secondary">
                  Use your recent journal context to get reflections, summaries,
                  and action-oriented coaching directly in the browser.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background px-4 py-3 text-right">
                <div className="text-xs uppercase tracking-wide text-text-secondary">
                  Status
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm font-medium text-text-primary">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isPuterReady ? 'bg-success' : 'bg-text-secondary'
                    }`}
                  />
                  {isPuterReady ? 'Puter.js ready' : 'Loading AI runtime...'}
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSubmit(prompt)}
                  className="rounded-2xl border border-border bg-background-secondary p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-text-primary">{prompt}</p>
                </button>
              ))}
            </div>

            <div className="rounded-3xl border border-border bg-background-secondary shadow-lg">
              <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary">Conversation</h2>
                  <p className="text-sm text-text-secondary">
                    {isPuterReady
                      ? 'Ask a question and let the assistant respond with your journal history in mind.'
                      : 'Waiting for the AI runtime to finish loading.'}
                  </p>
                </div>
              </div>

              <div className="max-h-[36rem] space-y-4 overflow-y-auto px-5 py-5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-background text-text-primary border border-border'
                      }`}
                    >
                      {message.content || (message.role === 'assistant' ? 'Thinking...' : '')}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-border p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSubmit();
                      }
                    }}
                    placeholder="Ask about your mood, themes, goals, or next steps..."
                    className="min-h-[56px] flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    rows={2}
                  />
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={!inputValue.trim() || isSending || !isPuterReady}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    Send
                  </button>
                </div>
                <p className="mt-3 text-xs text-text-secondary">
                  AI responses are generated in the browser through Puter.js. No
                  API key is required in Echo.
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border bg-background-secondary p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-text-primary">Recent Journal Context</h2>
              </div>
              <p className="whitespace-pre-line rounded-2xl bg-background p-4 text-sm leading-relaxed text-text-secondary">
                {journalContext}
              </p>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-lg">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">
                Best uses
              </h2>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li>Summarize recent thoughts into a clear weekly overview.</li>
                <li>Identify patterns in mood, stress, and recurring themes.</li>
                <li>Turn unstructured notes into actionable next steps.</li>
                <li>Draft a supportive reflection before or after recording.</li>
              </ul>
            </div>
          </aside>
        </div>
      </DashboardLayout>
    </>
  );
}