import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  FirebaseFirestoreTypes,
  serverTimestamp,
  orderBy,
} from '@react-native-firebase/firestore';
import { UserProfile } from '../../types/redux';

const firestore = getFirestore();

export const isUsernameTaken = async (username: string): Promise<boolean> => {
  const usernameDoc = await getDoc(doc(firestore, 'usernames', username));
  return usernameDoc.exists();
};

export const createUserProfile = async (
  userId: string,
  email: string,
  username: string,
) => {
  await setDoc(doc(firestore, 'usernames', username.toLowerCase()), {
    userId,
    username: username.toLowerCase(),
  });
  await setDoc(doc(firestore, 'users', userId), {
    email,
    username,
    stars: 0,
    streak: 0,
    createdAt: serverTimestamp(),
  });
};

export const getUserProfile = async (userId: string) => {
  const docSnap = await getDoc(doc(firestore, 'users', userId));
  if (!docSnap.exists()) return null;

  const data = docSnap.data();

  const profile: UserProfile = {
    id: docSnap.id,
    email: data?.email ?? '',
    username: data?.username ?? '',
    stars: data?.stars ?? 0,
    streak: data?.streak ?? 0,
    createdAt: data?.createdAt ?? null,
  };

  return profile;
};

export const updateUserProfile = async (userId: string, data: Partial<any>) => {
  await setDoc(doc(firestore, 'users', userId), data, { merge: true });
};

export const searchUsersByUsername = async (searchTerm: string) => {
  if (!searchTerm) return [];
  const usernamesRef = collection(firestore, 'usernames');

  const q = query(
    usernamesRef,
    where('username', '>=', searchTerm.toLowerCase()),
    where('username', '<=', searchTerm.toLowerCase() + '\uf8ff'),
    orderBy('username'),
  );

  const snap = await getDocs(q);
  return snap.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
    const data = doc.data();
    return {
      id: data.userId,
      username: data.username,
    };
  });
};
