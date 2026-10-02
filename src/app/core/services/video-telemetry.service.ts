import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { VideoEventPayload, VideoEventType } from '../models/telemetry';

@Injectable({
  providedIn: 'root'
})
export class VideoTelemetryService {
  private http = inject(HttpClient);
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  private getOrCreateSessionId(): string {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      let sid = sessionStorage.getItem('ayyou_video_feed_session_id');
      if (!sid) {
        sid = 'feed_session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('ayyou_video_feed_session_id', sid);
      }
      return sid;
    }
    return 'feed_session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  public logEvent(
    publicationId: string,
    eventType: VideoEventType,
    options: {
      watchTimeSeconds?: number;
      videoDurationSeconds?: number;
      progressPercent?: number;
      feedPosition?: number;
      metadata?: Record<string, any>;
    } = {}
  ): void {
    if (!publicationId) return;

    const payload: VideoEventPayload = {
      publication_id: publicationId,
      session_id: this.sessionId,
      event_type: eventType,
      watch_time_seconds: options.watchTimeSeconds || 0,
      video_duration_seconds: options.videoDurationSeconds || 0,
      progress_percent: options.progressPercent || 0,
      feed_position: options.feedPosition || 0,
      metadata: options.metadata || {}
    };

    const apiUrl = `${environment.apiUrl}/telemetry/video-event/`;
    this.http.post(apiUrl, payload).pipe(
      catchError(err => {
        // En cas d'erreur réseau, ne pas bloquer l'interface client
        return of(null);
      })
    ).subscribe();
  }
}
