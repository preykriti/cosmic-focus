import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  getDoc,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { getUserProfile } from './users';

const firestore = getFirestore();
const friendRequestsRef = collection(firestore, 'friendRequests');
const friendsRef = collection(firestore, 'friends');

export const sendFriendRequest = async (
  fromUserId: string,
  toUserId: string,
) => {
  const requestDoc = doc(friendRequestsRef);
  const senderProfile = await getUserProfile(fromUserId);
  await setDoc(requestDoc, {
    id: requestDoc.id,
    from: fromUserId,
    to: toUserId,
    status: 'pending',
    createdAt: serverTimestamp(),
    fromUsername: senderProfile?.username || null,
  });
  
  return requestDoc.id;
};

// get friends request
export const getIncomingRequests = async (userId: string) => {
  const q = query(
    friendRequestsRef,
    where('to', '==', userId),
    where('status', '==', 'pending'),
  );
  const snap = await getDocs(q);

  return snap.docs.map(
    (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => docSnap.data(),
  );
};

export const acceptFriendRequest = async (
  requestId: string,
  from: string,
  to: string,
) => {
  await updateDoc(doc(firestore, 'friendRequests', requestId), {
    status: 'accepted',
  });

  // add friendship entry
  const friendDoc = doc(friendsRef);
  await setDoc(friendDoc, {
    id: friendDoc.id,
    user1: from,
    user2: to,
    since: serverTimestamp(),
  });
};

// reject friend request
export const declineFriendRequest = async (requestId: string) => {
  await updateDoc(doc(firestore, 'friendRequests', requestId), {
    status: 'declined',
  });
};

export const getFriends = async (userId: string) => {
  const q1 = query(friendsRef, where('user1', '==', userId));
  const q2 = query(friendsRef, where('user2', '==', userId));

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  const friends: string[] = [];

  snap1.forEach((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
    const data = doc.data();
    friends.push(data.user2); // if current user is user1 → friend is user2
  });

  snap2.forEach((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
    const data = doc.data();
    friends.push(data.user1); // if current user is user2 → friend is user1
  });

  return friends;
};

export const getFriendsWithProfiles = async (userId: string) => {
  const friendIds = await getFriends(userId);
  if (friendIds.length === 0) return [];
  //fetch profiles in batch
  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('__name__', 'in', friendIds.slice(0, 10)));

  const snap = await getDocs(q);
  return snap.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// export const getFriendsWithProfiles = async (userId: string) => {
//   const friendIds = await getFriends(userId);

//   const promises = friendIds.map(fid => getDoc(doc(firestore, 'users', fid)));
//   const snaps = await Promise.all(promises);

//   return snaps
//     .filter(snap => snap.exists())
//     .map(snap => ({ id: snap.id, ...snap.data() }));
// };
export const getOutgoingRequests = async (userId: string) => {
  const q = query(
    friendRequestsRef,
    where('from', '==', userId),
    where('status', '==', 'pending'),
  );
  const snap = await getDocs(q);

  return snap.docs.map(
    (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => docSnap.data(),
  );
};