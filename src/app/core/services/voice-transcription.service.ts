import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TranscriptionResponse {
  success?: boolean;
  status: string;
  text?: string;
  transcription?: string;
  search_query?: string;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VoiceTranscriptionService {
  private apiUrl = `${environment.apiUrl}/api/search/voice/`;

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  private recording: boolean = false;
  private recordingStartTime: number = 0;

  constructor(private http: HttpClient) {}

  /**
   * Vérifie et demande les permissions microphone au navigateur.
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.warn('Microphone permission denied or not available:', err);
      return false;
    }
  }

  /**
   * Démarre l'enregistrement audio avec détection automatique du format MIME supporté.
   */
  async startRecording(): Promise<boolean> {
    try {
      this.audioChunks = [];
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const candidateTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/aac'
      ];

      let selectedMimeType = '';
      for (const type of candidateTypes) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      const options = selectedMimeType ? { mimeType: selectedMimeType } : {};
      this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
      this.recording = true;
      this.recordingStartTime = Date.now();
      return true;
    } catch (err) {
      console.error('Erreur au démarrage de l’enregistrement vocal:', err);
      this.recording = false;
      this.stopStream();
      return false;
    }
  }

  /**
   * Arrête l'enregistrement audio et retourne le Blob audio final.
   */
  stopRecording(): Promise<{ blob: Blob | null; durationMs: number }> {
    return new Promise((resolve) => {
      const durationMs = Date.now() - this.recordingStartTime;
      if (!this.mediaRecorder || !this.recording) {
        this.stopStream();
        resolve({ blob: null, durationMs });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.recording = false;
        this.stopStream();
        resolve({ blob: audioBlob, durationMs });
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        this.recording = false;
        this.stopStream();
        resolve({ blob: null, durationMs });
      }
    });
  }

  isRecordingNow(): boolean {
    return this.recording;
  }

  private stopStream(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.mediaRecorder = null;
  }

  /**
   * Envoie le Blob audio enregistré au backend /api/ai/transcribe/ pour transcription Whisper.
   */
  transcribeAudio(audioBlob: Blob): Observable<TranscriptionResponse> {
    const formData = new FormData();
    const ext = audioBlob.type.includes('ogg') ? 'ogg' : audioBlob.type.includes('mp4') ? 'mp4' : 'webm';
    formData.append('audio', audioBlob, `voice_recording.${ext}`);

    return this.http.post<TranscriptionResponse>(this.apiUrl, formData).pipe(
      catchError(error => {
        console.error('Erreur lors de la transcription backend:', error);
        const backendMessage = error.error?.message || error.error?.detail;
        return of({
          status: 'error',
          message: backendMessage || 'Impossible de joindre le service de transcription. Veuillez utiliser le clavier.'
        });
      })
    );
  }
}
