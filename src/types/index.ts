import { Timestamp } from 'firebase/firestore';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  selectedCourseId: string;
  paymentMethod: string;
  paymentNumber: string;
  transactionId: string;
  role: 'user' | 'admin';
  status: 'pending' | 'approved';
  activeSessions: DeviceSession[];
  createdAt: Timestamp;
}

export interface DeviceSession {
  deviceId: string;
  lastActive: number;
}

export interface Course {
  id: string;
  courseName: string;
  createdAt: Timestamp;
}

export interface Video {
  id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  pdfUrl: string;
  thumbnailUrl: string;
  createdAt: Timestamp;
}

export interface AppSettings {
  phoneNumber: string;
  socialLinks: SocialLink[];
}

export interface SocialLink {
  label: string;
  url: string;
  icon: string;
}
