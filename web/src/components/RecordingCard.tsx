import { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import toast from 'react-hot-toast';

export default function RecordingCard() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processRecording(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('tagline', 'New Entry');
      formData.append('gradient', 'default');

      await apiClient.post('/journals', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Entry saved successfully!');
      setDuration(0);
    } catch (error) {
      toast.error('Failed to save entry');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-background-secondary rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Record Your Thoughts
      </h2>

      <div className="flex flex-col items-center justify-center py-12">
        {/* Recording Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-error shadow-lg shadow-error/50 animate-pulse-slow'
              : 'bg-primary hover:bg-primary-dark shadow-xl'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          ) : isRecording ? (
            <Square className="w-12 h-12 text-white" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
        </button>

        {/* Duration Display */}
        {isRecording && (
          <div className="mt-6 text-3xl font-mono font-bold text-text-primary">
            {formatTime(duration)}
          </div>
        )}

        {/* Status Text */}
        <p className="mt-4 text-text-secondary">
          {isProcessing
            ? 'Processing your entry...'
            : isRecording
            ? 'Tap to stop recording'
            : 'Tap to start recording'}
        </p>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-background rounded-lg">
        <h3 className="font-semibold text-text-primary mb-2">Tips:</h3>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• Speak clearly and naturally</li>
          <li>• Find a quiet environment</li>
          <li>• Share your thoughts, feelings, and goals</li>
          <li>• AI will analyze and extract insights</li>
        </ul>
      </div>
    </div>
  );
}
