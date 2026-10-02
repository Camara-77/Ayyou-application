export type VideoEventType =
  | 'IMPRESSION'
  | 'PLAY'
  | 'PAUSE'
  | 'WATCH'
  | 'COMPLETED'
  | 'SKIP'
  | 'LIKE'
  | 'UNLIKE'
  | 'SHARE'
  | 'CART_ADD'
  | 'DISH_CLICK';

export interface VideoEventPayload {
  publication_id: string;
  session_id: string;
  event_type: VideoEventType;
  watch_time_seconds?: number;
  video_duration_seconds?: number;
  progress_percent?: number;
  feed_position?: number;
  metadata?: Record<string, any>;
}
