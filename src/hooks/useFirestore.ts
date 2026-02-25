import { useState, useEffect } from 'react';
import {
  collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, getDoc, setDoc, writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Course, Video, AppSettings, AppUser } from '@/types';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'courses'), orderBy('createdAt', 'desc')),
      (snap) => {
        setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const addCourse = async (courseName: string) => {
    await addDoc(collection(db, 'courses'), { courseName, createdAt: Timestamp.now() });
  };

  const updateCourse = async (id: string, courseName: string) => {
    await updateDoc(doc(db, 'courses', id), { courseName });
  };

  const deleteCourse = async (id: string) => {
    await deleteDoc(doc(db, 'courses', id));
  };

  return { courses, loading, addCourse, updateCourse, deleteCourse };
};

export const useVideos = (courseId?: string) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) {
      setVideos([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'videos'),
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Video)));
      setLoading(false);
    });
    return unsub;
  }, [courseId]);

  const addVideo = async (data: Omit<Video, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, 'videos'), { ...data, createdAt: Timestamp.now() });
  };

  const updateVideo = async (id: string, data: Partial<Video>) => {
    await updateDoc(doc(db, 'videos', id), data);
  };

  const deleteVideo = async (id: string) => {
    await deleteDoc(doc(db, 'videos', id));
  };

  return { videos, loading, addVideo, updateVideo, deleteVideo };
};

export const useAllUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      (snap) => {
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser)));
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const updateUserStatus = async (id: string, status: 'pending' | 'approved') => {
    await updateDoc(doc(db, 'users', id), { status });
  };

  const updateUserRole = async (id: string, role: 'user' | 'admin') => {
    await updateDoc(doc(db, 'users', id), { role });
  };

  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
  };

  return { users, loading, updateUserStatus, updateUserRole, deleteUser };
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'app'), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as AppSettings);
      } else {
        setSettings({ phoneNumber: '', socialLinks: [] });
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const updateSettings = async (data: Partial<AppSettings>) => {
    await setDoc(doc(db, 'settings', 'app'), data, { merge: true });
  };

  return { settings, loading, updateSettings };
};

export const exportAllData = async () => {
  const data: Record<string, any[]> = {};
  for (const col of ['users', 'courses', 'videos']) {
    const snap = await getDocs(collection(db, col));
    data[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  const settingsSnap = await getDoc(doc(db, 'settings', 'app'));
  data.settings = settingsSnap.exists() ? [settingsSnap.data()] : [];
  return data;
};

export const importAllData = async (data: Record<string, any[]>) => {
  const batch = writeBatch(db);
  
  for (const [colName, items] of Object.entries(data)) {
    if (colName === 'settings' && items.length > 0) {
      batch.set(doc(db, 'settings', 'app'), items[0]);
    } else {
      for (const item of items) {
        const { id, ...rest } = item;
        batch.set(doc(db, colName, id), rest);
      }
    }
  }
  
  await batch.commit();
};
