import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  points: number;
  lastVisit: Date;
  visitCount: number;
  isOnline?: boolean;
  lastActive?: Date;
  isAdmin?: boolean;
  role?: 'participant' | 'organizer';
  streak: number;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  is_admin?: boolean;
  [key: string]: any;
}

export interface AdminAction {
  type: 'ADD_POINTS' | 'RESET_STATS' | 'MAKE_ADMIN' | 'SET_ROLE' | 'UPDATE_USER_DATA';
  points?: number;
  role?: 'participant' | 'organizer';
  presetData?: {
    firstName: string;
    lastName: string;
    photoUrl: string;
  };
}