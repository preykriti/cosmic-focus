import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  increment,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { getUserProfile } from './users';

const db = getFirestore();
const commentsRef = collection(db, 'comments');
const feedsRef = collection(db, 'feeds');

export interface Comment {
  id: string;
  feedId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Date | null;
}

// add a new comment
export const addComment = async (
  feedId: string,
  userId: string,
  text: string,
): Promise<Comment> => {
  try {
    const userProfile = await getUserProfile(userId);
    if (!userProfile) throw new Error('User profile not found');

    const commentRef = doc(commentsRef); 
    const now = Timestamp.now();

    const commentData = {
      id: commentRef.id,
      feedId,
      userId,
      username: userProfile.username,
      text: text.trim(),
      createdAt: now,
    };

    await setDoc(commentRef, commentData);
    console.log('Comment created:', commentData);

    const feedRef = doc(db, 'feeds', feedId);
    await updateDoc(feedRef, {
      commentCount: increment(1),
    });
    console.log('Comment count updated for feed:', feedId);

    return {
      ...commentData,
      createdAt: now.toDate(),
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// get comments for a feed
export const getCommentsForFeed = async (
  feedId: string,
): Promise<Comment[]> => {
  const q = query(
    commentsRef,
    where('feedId', '==', feedId),
    orderBy('createdAt', 'asc'),
  );
  const snap = await getDocs(q);

  return snap.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      feedId: data.feedId,
      userId: data.userId,
      username: data.username,
      text: data.text,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
    };
  });
};

export const deleteComment = async (
  commentId: string,
  feedId: string,
): Promise<void> => {
  const commentRef = doc(db, 'comments', commentId);
  await deleteDoc(commentRef);

  const feedRef = doc(db, 'feeds', feedId);
  await updateDoc(feedRef, {
    commentCount: increment(-1),
  });
};

export const deleteAllCommentsForFeed = async (
  feedId: string,
): Promise<void> => {
  const q = query(commentsRef, where('feedId', '==', feedId));
  const snap = await getDocs(q);

  const deletePromises = snap.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot): Promise<void> =>
    deleteDoc(doc(db, 'comments', docSnap.id)),
  );
  await Promise.all(deletePromises);
};
