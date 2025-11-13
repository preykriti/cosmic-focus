import {
  getFirestore,
  doc,
  updateDoc,
  Timestamp,
  increment,
  runTransaction,
} from '@react-native-firebase/firestore';

const firestore = getFirestore();

export const calculateStars = (
  sessionType: string,
  duration: number,
): number => {
  if (sessionType === 'pomodoro') {
    return duration === 25 * 60 ? 5 : 10; // 5 stars for 25min, 10 for 50min
  }
  return 0;
};

export const calculateDeadStars = (
  sessionType: string,
  duration: number,
): number => {
  if (sessionType === 'pomodoro') {
    return 1;
  }
  return 0;
};

export const updateDeadStarsAndBlackHoles = async (
  transaction: any,
  userRef: any,
  deadStarsToAdd: number,
): Promise<void> => {
  // Get current user data
  const userSnap = await transaction.get(userRef);
  const userData = userSnap.data();
  const currentDeadStars = userData?.deadStars || 0;
  const newDeadStarTotal = currentDeadStars + deadStarsToAdd;

  const newBlackHoles = Math.floor(newDeadStarTotal / 3);
  const currentBlackHoles = userData?.blackholes || 0;
  const blackHolesToAdd = newBlackHoles - currentBlackHoles;
  const remainingDeadStars = newDeadStarTotal % 3;

  if (blackHolesToAdd > 0) {
    transaction.update(userRef, {
      deadStars: remainingDeadStars,
      blackholes: increment(blackHolesToAdd),
    });
  } else {
    transaction.update(userRef, {
      deadStars: increment(deadStarsToAdd),
    });
  }
};

//for successful pomodoro completion
export const updateUserStatsForCompletion = async (
  _transaction: any,
  userId: string,
  sessionType: string,
  duration: number,
  taskId?: string,
): Promise<void> => {
  if (sessionType !== 'pomodoro') return;

  const starsEarned = calculateStars(sessionType, duration);
  const focusMinutes = Math.floor(duration / 60);

  try {
    await runTransaction(firestore, async transaction => {
      const userRef = doc(firestore, 'users', userId);
      transaction.update(userRef, {
        stars: increment(starsEarned),
        totalFocusMinutes: increment(focusMinutes),
        totalPomodoros: increment(1),
        lastPomodoroDate: Timestamp.now(),
      });

      if (taskId) {
        const taskRef = doc(firestore, 'tasks', taskId);
        transaction.update(taskRef, {
          completedPomodoros: increment(1),
          updatedAt: Timestamp.now(),
        });
      }
    });
  } catch (error) {
    console.error('Failed to update user stats:', error);
    throw error;
  }
};

export const applyAbandonmentPenalty = async (
  _transaction: any,
  userId: string,
  sessionType: string,
  duration: number,
): Promise<void> => {
  const deadStarsToAdd = calculateDeadStars(sessionType, duration);
  if (deadStarsToAdd > 0) {
    try {
      await runTransaction(firestore, async transaction => {
        const userRef = doc(firestore, 'users', userId);
        await updateDeadStarsAndBlackHoles(
          transaction,
          userRef,
          deadStarsToAdd,
        );
      });
    } catch (error) {
      console.error('Failed to apply abandonment penalty:', error);
      throw error;
    }
  }
};
export const applyGroupPenalties = async (
  _transaction: any,
  affectedParticipants: string[],
  quitterId: string,
  sessionType: string,
  duration: number,
  penaltyAmount: number,
): Promise<void> => {
  console.log(`Applying group penalties:`, {
    affectedParticipants,
    quitterId,
    sessionType,
    penaltyAmount,
  });

  try {
    await runTransaction(firestore, async transaction => {
      for (const participantId of affectedParticipants) {
        console.log(`Applying penalty to user: ${participantId}`);
        const userRef = doc(firestore, 'users', participantId);
        await updateDeadStarsAndBlackHoles(transaction, userRef, penaltyAmount);
      }
    });

    console.log('Group penalties applied successfully');
  } catch (error) {
    console.error('Failed to apply group penalties:', error);
    throw error;
  }
};
