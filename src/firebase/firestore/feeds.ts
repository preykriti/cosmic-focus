import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from '@react-native-firebase/firestore';
import { getUserProfile } from './users';

const db = getFirestore();
const feedsRef = collection(db, 'feeds');

export type FeedType = 'session' | 'stars' | 'days';

export interface Feed {
  id: string;
  userId: string;
  username: string;
  type: FeedType;
  amount: number;
  message?: string;
  likes: string[];
  commentCount: number;
  createdAt: Date | null;
}

// create a new feed
export const createFeed = async (
  userId: string,
  type: FeedType,
  amount: number,
  message?: string,
): Promise<Feed> => {
  const userProfile = await getUserProfile(userId);
  if (!userProfile) throw new Error('User profile not found');

  const feedRef = doc(feedsRef); // auto-ID
  const now = Timestamp.now();

  const feedData: Omit<Feed, 'createdAt'> & { createdAt: Timestamp } = {
    id: feedRef.id,
    userId,
    username: userProfile.username,
    type,
    amount,
    message: message || '',
    likes: [],
    commentCount: 0,
    createdAt: now,
  };

  await setDoc(feedRef, feedData);

  return { ...feedData, createdAt: now.toDate() };
};

export const getFeedById = async (feedId: string): Promise<Feed | null> => {
  const feedRef = doc(db, 'feeds', feedId);
  const feedSnap = await getDoc(feedRef);

  if (!feedSnap.exists()) return null;

  const data = feedSnap.data();
  return {
    id: feedSnap.id,
    userId: data?.userId,
    username: data?.username,
    type: data?.type,
    amount: data?.amount,
    message: data?.message,
    likes: data?.likes || [],
    commentCount: data?.commentCount || 0,
    createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : null,
  };
};

export const getFeedsForUser = async (userId: string): Promise<Feed[]> => {
  const q = query(
    feedsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);

  return snap.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId,
      username: data.username,
      type: data.type,
      amount: data.amount,
      message: data.message,
      likes: data.likes || [],
      commentCount: data.commentCount || 0,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
    };
  });
};

export const getFriendFeeds = async (friendIds: string[]): Promise<Feed[]> => {
  if (friendIds.length === 0) return [];

  try {
    if (friendIds.length === 1) {
      const q = query(
        feedsRef,
        where('userId', '==', friendIds[0]),
        orderBy('createdAt', 'desc'),
      );
      const snap = await getDocs(q);

      return snap.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId,
          username: data.username,
          type: data.type,
          amount: data.amount,
          message: data.message,
          likes: data.likes || [],
          commentCount: data.commentCount || 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
        };
      });
    }

    const batches: string[][] = [];
    for (let i = 0; i < friendIds.length; i += 10) {
      batches.push(friendIds.slice(i, i + 10));
    }

    const promises = batches.map(batch => {
      const q = query(
        feedsRef,
        where('userId', 'in', batch),
        orderBy('createdAt', 'desc'),
      );
      return getDocs(q);
    });

    const results = await Promise.all(promises);

    const allFeeds: Feed[] = results.flatMap(snap =>
      snap.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId,
          username: data.username,
          type: data.type,
          amount: data.amount,
          message: data.message,
          likes: data.likes || [],
          commentCount: data.commentCount || 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
        };
      }),
    );

    return allFeeds.sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
    );
  } catch (error) {
    console.error('Error fetching friend feeds:', error);
    throw error;
  }
};

// like a feed/post
export const likeFeed = async (
  feedId: string,
  userId: string,
): Promise<void> => {
  const feedRef = doc(db, 'feeds', feedId);
  await updateDoc(feedRef, {
    likes: arrayUnion(userId),
  });
};

export const unlikeFeed = async (
  feedId: string,
  userId: string,
): Promise<void> => {
  const feedRef = doc(db, 'feeds', feedId);
  await updateDoc(feedRef, {
    likes: arrayRemove(userId),
  });
};

export const deleteFeed = async (feedId: string): Promise<void> => {
  const feedRef = doc(db, 'feeds', feedId);
  await deleteDoc(feedRef);
};
