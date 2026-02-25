import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, Timestamp, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AppUser, DeviceSession } from '@/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  selectedCourseId: string;
  paymentMethod: string;
  paymentNumber: string;
  transactionId: string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

const getDeviceId = (): string => {
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('device_id', id);
  }
  return id;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppUser = async (uid: string): Promise<AppUser | null> => {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as AppUser;
    }
    return null;
  };

  const manageDeviceSession = async (uid: string) => {
    const deviceId = getDeviceId();
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return;

    const data = userDoc.data();
    let sessions: DeviceSession[] = data.activeSessions || [];

    // Check if this device already has a session
    const existingIndex = sessions.findIndex(s => s.deviceId === deviceId);
    if (existingIndex !== -1) {
      sessions[existingIndex].lastActive = Date.now();
    } else {
      // If 2+ sessions exist, remove oldest
      if (sessions.length >= 2) {
        sessions.sort((a, b) => a.lastActive - b.lastActive);
        sessions = sessions.slice(1); // remove oldest
      }
      sessions.push({ deviceId, lastActive: Date.now() });
    }

    await updateDoc(doc(db, 'users', uid), { activeSessions: sessions });
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const userData = await fetchAppUser(user.uid);
        setAppUser(userData);
        if (userData) {
          await manageDeviceSession(user.uid);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const register = async (data: RegisterData) => {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const deviceId = getDeviceId();
    
    const userData: Omit<AppUser, 'id'> = {
      name: data.name,
      email: data.email,
      selectedCourseId: data.selectedCourseId,
      paymentMethod: data.paymentMethod,
      paymentNumber: data.paymentNumber,
      transactionId: data.transactionId,
      role: 'user',
      status: 'pending',
      activeSessions: [{ deviceId, lastActive: Date.now() }],
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'users', cred.user.uid), userData);
    setAppUser({ id: cred.user.uid, ...userData });
  };

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userData = await fetchAppUser(cred.user.uid);
    if (userData) {
      await manageDeviceSession(cred.user.uid);
      setAppUser(userData);
    }
  };

  const logout = async () => {
    const deviceId = getDeviceId();
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const sessions: DeviceSession[] = userDoc.data().activeSessions || [];
          const filtered = sessions.filter(s => s.deviceId !== deviceId);
          await updateDoc(doc(db, 'users', firebaseUser.uid), { activeSessions: filtered });
        }
      } catch (e) {}
    }
    await signOut(auth);
    setAppUser(null);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
