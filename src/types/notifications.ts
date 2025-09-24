export type NotificationType = 
  | 'group_invite'
  | 'session_start'
  | 'session_abandoned'
  | 'friend_request';

export interface NotificationData {
  type: NotificationType;
  sessionId?: string;
  groupId?: string;
  fromUserId?: string;
  fromUsername?: string;
  timestamp: number;
}

export interface PushNotification {
  title: string;
  body: string;
  data: NotificationData;
}