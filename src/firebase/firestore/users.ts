import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from '@react-native-firebase/firestore';

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
  await setDoc(doc(firestore, 'usernames', username), { userId });
  await setDoc(doc(firestore, 'users', userId), {
    email,
    username,
    stars: 0,
    streak: 0,
    friends: [],
    createdAt: new Date(),
  });
};

export const getUserProfile = async (userId: string) => {
  const docSnap = await getDoc(doc(firestore, 'users', userId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

export const updateUserProfile = async (userId: string, data: Partial<any>) => {
  await setDoc(doc(firestore, 'users', userId), data, { merge: true });
};
