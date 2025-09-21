import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from '@react-native-firebase/firestore';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

interface Task {
  id: string;
  title: string;
  description?: string;
  tag: string;
  priority: 'low' | 'medium' | 'high';
  pomodoroLength: 25 | 50;
  breakLength: 5 | 10;
  plannedPomodoros: number;
  completedPomodoros: number;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface TaskInput {
  title: string;
  description?: string;
  tag: string;
  priority: 'low' | 'medium' | 'high';
  pomodoroLength: 25 | 50;
  breakLength: 5 | 10;
  plannedPomodoros: number;
  completedPomodoros?: number;
}

const firestore = getFirestore();
const tasksCollection: FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData> =
  collection(firestore, 'tasks');

export const createTask = async (
  userId: string,
  taskData: TaskInput,
): Promise<Task> => {
  const newTaskRef = doc(tasksCollection);
  const taskWithMetadata = {
    ...taskData,
    completedPomodoros: taskData.completedPomodoros || 0,
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(newTaskRef, taskWithMetadata);
  return { id: newTaskRef.id, ...taskWithMetadata };
};

// fetch all tasks of a user
export const getUserTasks = async (userId: string): Promise<Task[]> => {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('Invalid userId provided');
  }
  const q = query(
    tasksCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const querySnapshot = await getDocs(q);
  const tasks: Task[] = [];

  querySnapshot.forEach(
    (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
      const data = docSnap.data();
      tasks.push({
        id: docSnap.id,
        ...data,
      } as Task);
    },
  );

  return tasks;
};

// update
export const updateTask = async (
  taskId: string,
  userId: string,
  updatedData: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
): Promise<void> => {
  const taskRef = doc(tasksCollection, taskId);
  await updateDoc(taskRef, {
    ...updatedData,
    updatedAt: Timestamp.now(),
  });
};

// delete
export const deleteTask = async (
  taskId: string,
  userId: string,
): Promise<void> => {
  await deleteDoc(doc(tasksCollection, taskId));
};