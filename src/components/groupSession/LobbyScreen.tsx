import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { doc, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  acceptGroupInvitation,
  declineGroupInvitation,
  FocusSession,
  GroupParticipant,
} from '../../firebase/firestore/focusSession';
import { displayNotification } from '../../firebase/notifications/notificationHandler';
import { getFirestore } from '@react-native-firebase/firestore';
import { useAppSelector } from '../../store/hooks';

type LobbyScreenRouteProp = RouteProp<
  { params: { sessionId: string } },
  'params'
>;

export const LobbyScreen: React.FC = () => {
  let CURRENT_USER_ID: any = 'xeZaCETjEpUa6s1V9gP0kGpZN9v1';
  let CURRENT_USERNAME: any = 'tom';
  const route = useRoute<LobbyScreenRouteProp>();
  const navigation = useNavigation();
  const { sessionId } = route.params;
  const firestore = getFirestore();

  const { user } = useAppSelector(state => state.auth);
  CURRENT_USER_ID = user?.id;
  CURRENT_USERNAME = user?.username;

  const [session, setSession] = useState<FocusSession | null>(null);
  const [loading, setLoading] = useState(true);

  const hasShownNotification = useRef<boolean>(false);
  const previousInviteStatus = useRef<string | null>(null);
  const hasNavigatedToPomodoro = useRef<boolean>(false);

  useEffect(() => {
    console.log('Setting up Firestore listener for session:', sessionId);
    const sessionRef = doc(firestore, 'focusSessions', sessionId);

    const unsubscribe = onSnapshot(
      sessionRef,
      snapshot => {
        console.log('Firestore snapshot received:', snapshot.exists());

        if (snapshot.exists()) {
          const sessionData = snapshot.data() as FocusSession;
          console.log('Session data:', sessionData);
          setSession(sessionData);

          if (
            sessionData.sessionStatus === 'active' &&
            sessionData.status === 'active' &&
            !hasNavigatedToPomodoro.current
          ) {
            console.log('Session started, navigating to Pomodoro screen');
            hasNavigatedToPomodoro.current = true;

            // Navigate to PomodoroScreen with group session parameters
            navigation.navigate('Pomodoro', {
              autoStartNext: false,
              isGroupSession: true,
              groupSessionId: sessionId,
              task: null,
            });
            return; // Exit early since we're navigating away
          }

          const currentUserParticipant = sessionData.participants?.find(
            participant => participant.userId === CURRENT_USER_ID,
          );

          if (currentUserParticipant) {
            const currentStatus = currentUserParticipant.status;
            if (
              currentStatus === 'invited' &&
              !hasShownNotification.current &&
              previousInviteStatus.current !== 'invited'
            ) {
              console.log('Showing notification for new invitation');
              displayNotification(
                'Group Focus Invite',
                `You have been invited to join: ${
                  sessionData.groupName || 'Session'
                }`,
                { sessionId },
              );
              hasShownNotification.current = true;
            }

            previousInviteStatus.current = currentStatus;
          }
        } else {
          console.log('Session not found');
          Alert.alert('Session not found');
          navigation.goBack();
        }
        setLoading(false);
      },
      error => {
        console.error('Firestore listener error:', error);
        setLoading(false);
      },
    );

    return () => {
      console.log('Cleaning up Firestore listener');
      unsubscribe();
    };
  }, [sessionId, firestore, navigation, CURRENT_USER_ID]);

  const acceptInvite = async () => {
    if (!session) return;

    if (!CURRENT_USER_ID || !CURRENT_USERNAME) {
      console.error('Missing user data', { CURRENT_USER_ID, CURRENT_USERNAME });
      Alert.alert('Error', 'User info not loaded yet');
      return;
    }

    try {
      console.log('Accepting invitation for user:', CURRENT_USER_ID);
      await acceptGroupInvitation(sessionId, CURRENT_USER_ID, CURRENT_USERNAME);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      Alert.alert('Error', 'Failed to accept invitation');
    }
  };

  const declineInvite = async () => {
    if (!session) return;

    try {
      console.log('Declining invitation for user:', CURRENT_USER_ID);
      await declineGroupInvitation(sessionId, CURRENT_USER_ID);
      navigation.goBack();
    } catch (error) {
      console.error('Error declining invitation:', error);
      Alert.alert('Error', 'Failed to decline invitation');
    }
  };

  const startSession = async () => {
    if (!session) return;

    try {
      const sessionRef = doc(firestore, 'focusSessions', sessionId);

      await updateDoc(sessionRef, {
        status: 'active',
        sessionStatus: 'active',
        startedAt: new Date(),
        startTime: new Date(),
      });

      // navigation.navigate('Pomodoro', {
      //   autoStartNext: false,
      //   isGroupSession: true,
      //   groupSessionId: sessionId,
      //   task: null,
      // });
      console.log('Session started successfully');
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start session');
    }
  };

  // ---- Render participant row ----
  const renderParticipant = ({ item }: { item: GroupParticipant }) => {
    const isCurrentUser = item.userId === CURRENT_USER_ID;

    return (
      <View style={styles.participantRow}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.status}>{item.status}</Text>

        {isCurrentUser && item.status === 'invited' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={acceptInvite}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={declineInvite}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading || !session) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  const canStart =
    session.hostUserId === CURRENT_USER_ID &&
    session.participants.some(
      p => p.status === 'accepted' || p.status === 'active',
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {session.groupName || 'Group Session'} - Lobby
      </Text>
      <Text style={styles.subtitle}>Host: {session.hostUserId}</Text>

      <FlatList
        data={session.participants || []}
        keyExtractor={item => item.userId}
        renderItem={renderParticipant}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {session.hostUserId === CURRENT_USER_ID && (
        <TouchableOpacity
          style={[styles.startButton, !canStart && { backgroundColor: '#ccc' }]}
          disabled={!canStart}
          onPress={startSession}
        >
          <Text style={styles.startText}>Start Session</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 16 },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
  },
  username: { fontSize: 16 },
  status: { fontSize: 14, color: '#777', marginRight: 10 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  acceptButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 6,
  },
  declineButton: {
    backgroundColor: '#f44336',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  startButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 12,
    position: 'absolute',
    bottom: 20,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  startText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
