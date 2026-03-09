'use client';

import { useState, useRef } from 'react';
import { Upload, Mic, Trash2, Loader2, Play, Pause } from 'lucide-react';

interface AudioUploaderProps {
    onAnalyze: (base64Audio: string, transcript: string) => void;
    isLoading: boolean;
}

export function AudioUploader({ onAnalyze, isLoading }: AudioUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const MAX_FILE_SIZE_MB = 25;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (uploadedFile) {
            if (uploadedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                alert(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please upload a smaller file.`);
                e.target.value = '';
                return;
            }
            setFile(uploadedFile);
            setAudioUrl(URL.createObjectURL(uploadedFile));
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
                setFile(audioFile);
                setAudioUrl(URL.createObjectURL(audioBlob));
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Recording error:', err);
            alert('Could not access microphone.');
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async () => {
        console.log('Analysis button clicked');
        if (!file && !transcript) {
            console.log('No file or transcript provided');
            return;
        }

        console.log('Converting file to base64...');
        const base64 = file ? await convertToBase64(file) : '';
        console.log('Sending data for analysis...');
        onAnalyze(base64, transcript);
    };

    const removeFile = () => {
        setFile(null);
        setAudioUrl(null);
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
    };

    return (
        <div className="space-y-6 w-full max-w-2xl mx-auto">
            {/* 1. UPLOAD BOX */}
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-3xl glass-hover glass transition-all duration-300 relative overflow-hidden group">
                {!file && (
                    <>
                        <input
                            type="file"
                            accept="audio/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={handleFileUpload}
                        />
                        <div className={`p-5 rounded-2xl ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-blue-500/10 text-blue-400'} group-hover:scale-110 transition-transform`}>
                            {isRecording ? <Mic className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
                        </div>
                        <p className="mt-4 text-xl font-semibold text-gray-200">
                            {isRecording ? 'Recording...' : 'Choose an audio file'}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">MP3, WAV, or WebM</p>
                    </>
                )}

                {file && (
                    <div className="w-full space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 cursor-pointer hover:scale-110 transition-transform" onClick={() => audioRef.current?.play()}>
                                    <Play className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-gray-200 max-w-[200px] truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button onClick={removeFile} className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-colors">
                                <Trash2 className="w-6 h-6" />
                            </button>
                        </div>

                        {audioUrl && (
                            <audio
                                ref={audioRef}
                                src={audioUrl}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                className="hidden"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* 2. RECORD BUTTON */}
            {!file && (
                <div className="flex justify-center">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex items-center space-x-2 px-8 py-3 rounded-2xl font-bold transition-all duration-200 ${isRecording
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse'
                                : 'bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10'
                            }`}
                    >
                        {isRecording ? <Pause className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        <span>{isRecording ? 'Stop Recording' : 'Start Microphone'}</span>
                    </button>
                </div>
            )}

            {/* 3. OPTIONAL TRANSCRIPT */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-400 px-1 italic">Transcript (Optional)</label>
                <textarea
                    placeholder="Provide text to improve analysis accuracy..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="w-full h-32 glass p-4 rounded-2xl focus:ring-2 focus:ring-accent border-white/10 outline-none text-gray-200 placeholder-gray-600 resize-none"
                />
            </div>

            {/* 4. MAIN ANALYZE BUTTON */}
            {(file || transcript) && (
                <button
                    disabled={isLoading}
                    onClick={handleSubmit}
                    className="w-full py-5 bg-gradient-to-r from-accent to-accent-secondary text-white font-black text-xl rounded-2xl shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-100 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-4 group"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-7 h-7 animate-spin" />
                            <span>ANALYZING...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                            <span>START ANALYZE</span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
