import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from '@react-native-firebase/firestore';
import { backgroundInviteListener } from '../services/backgroundInviteListener';
import { displayNotification } from '../firebase/notifications/notificationHandler';
import { useAppSelector } from '../store/hooks';
import { useNavigation } from '@react-navigation/native';

export const SessionDebugComponent: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [sessionId, setSessionId] = useState<string>('');
  const firestore = getFirestore();
  const navigation = useNavigation();

  const checkSession = async (id: string) => {
    try {
      console.log('🔍 Checking session:', id);
      const sessionRef = doc(firestore, 'focusSessions', id);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        const sessionData = sessionSnap.data();
        console.log('✅ Session data:', JSON.stringify(sessionData, null, 2));
        
        const participants = sessionData.participants || [];
        const userParticipant = participants.find(p => p.userId === user?.id);
        
        Alert.alert(
          'Session Found', 
          `Participants: ${participants.length}\nHost: ${sessionData.hostUserId}\nYour Status: ${userParticipant?.status || 'Not invited'}\nSession Status: ${sessionData.sessionStatus}`
        );
      } else {
        Alert.alert('Session Not Found', 'No session with this ID exists');
      }
    } catch (error) {
      console.error('❌ Error checking session:', error);
      Alert.alert('Error', 'Failed to check session: ' + error.message);
    }
  };

  const testCreateSession = async () => {
    console.log('👤 Current user:', user);
    Alert.alert(
      'User Info', 
      `ID: ${user?.id}\nUsername: ${user?.username}\nEmail: ${user?.email}`
    );
  };

  const checkUserSessions = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    try {
      console.log('🔍 Checking sessions for user:', user.id);
      const q = query(
        collection(firestore, 'focusSessions'),
        where('sessionMode', '==', 'group')
      );
      
      const querySnapshot = await getDocs(q);
      const userSessions = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const userParticipant = data.participants?.find(p => p.userId === user.id);
        if (userParticipant) {
          userSessions.push({
            id: doc.id,
            status: userParticipant.status,
            groupName: data.groupName,
            sessionStatus: data.sessionStatus
          });
        }
      });

      console.log('👥 User sessions:', userSessions);
      Alert.alert(
        'Your Sessions', 
        `Found ${userSessions.length} sessions\n` + 
        userSessions.map(s => `${s.groupName}: ${s.status}`).join('\n')
      );
    } catch (error) {
      console.error('❌ Error checking user sessions:', error);
      Alert.alert('Error', 'Failed to check sessions: ' + error.message);
    }
  };

  const testNotification = async () => {
    console.log('🔔 Testing notification');
    await displayNotification(
      'Test Notification',
      'This is a test notification',
      { sessionId: 'test-session-id' }
    );
  };

  const checkBackgroundListener = () => {
    const status = backgroundInviteListener.triggerManualCheck();
    Alert.alert(
      'Background Listener Status',
      `Is Listening: ${status.isListening}\nUser ID: ${status.currentUserId}\nProcessed: ${status.processedCount}`
    );
  };

  const forceCheckInvitation = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔍 Force checking invitation for session:', '75G0tBJ4bDoiytOCRr83');
      const sessionRef = doc(firestore, 'focusSessions', '75G0tBJ4bDoiytOCRr83');
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        const sessionData = sessionSnap.data();
        const userParticipant = sessionData.participants?.find(p => p.userId === user.id);
        
        if (userParticipant?.status === 'invited') {
          console.log('🎯 Found invitation, triggering notification manually');
          await displayNotification(
            'Group Focus Invite',
            `You have been invited to join: ${sessionData.groupName || 'Focus Session'}`,
            { sessionId: '75G0tBJ4bDoiytOCRr83' }
          );
          Alert.alert('Success', 'Manual notification triggered!');
        } else {
          Alert.alert('Info', `Your status: ${userParticipant?.status || 'Not found'}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const testNavigation = () => {
    // Test direct navigation to LobbyScreen
    navigation.navigate('Lobby', { sessionId: '75G0tBJ4bDoiytOCRr83' });
  };

  const clearProcessedInvites = () => {
    // Reset the background listener to clear processed invitations
    backgroundInviteListener.stopListening();
    if (user?.id) {
      backgroundInviteListener.startListening(user.id);
    }
    Alert.alert('Success', 'Cleared processed invitations and restarted listener');
  };


  const testNotificationNavigation = async () => {
    // Test the notification handler navigation
    await displayNotification(
      'Test Navigation',
      'Click this notification to test navigation',
      { sessionId: '75G0tBJ4bDoiytOCRr83' }
    );
    Alert.alert('Test Sent', 'Click the notification to test navigation');
  };

  return (
    <View style={debugStyles.container}>
      <Text style={debugStyles.title}>🔧 Debug Panel</Text>
      
      <TouchableOpacity style={debugStyles.button} onPress={testCreateSession}>
        <Text style={debugStyles.buttonText}>Check Current User</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={debugStyles.button} onPress={checkUserSessions}>
        <Text style={debugStyles.buttonText}>Check My Sessions</Text>
      </TouchableOpacity>

      <View style={debugStyles.inputContainer}>
        <TextInput
          style={debugStyles.input}
          placeholder="Enter Session ID"
          value={sessionId}
          onChangeText={setSessionId}
        />
        <TouchableOpacity 
          style={debugStyles.smallButton} 
          onPress={() => checkSession(sessionId)}
        >
          <Text style={debugStyles.buttonText}>Check</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={debugStyles.button} onPress={testNotification}>
        <Text style={debugStyles.buttonText}>Test Notification</Text>
      </TouchableOpacity>

      <TouchableOpacity style={debugStyles.button} onPress={checkBackgroundListener}>
        <Text style={debugStyles.buttonText}>Check Listener Status</Text>
      </TouchableOpacity>

      <TouchableOpacity style={debugStyles.button} onPress={clearProcessedInvites}>
        <Text style={debugStyles.buttonText}>Clear & Restart Listener</Text>
      </TouchableOpacity>

      <TouchableOpacity style={debugStyles.button} onPress={forceCheckInvitation}>
        <Text style={debugStyles.buttonText}>Force Check Known Session</Text>
      </TouchableOpacity>

      <TouchableOpacity style={debugStyles.button} onPress={testNavigation}>
        <Text style={debugStyles.buttonText}>Test Direct Navigation</Text>
      </TouchableOpacity>

      <TouchableOpacity style={debugStyles.button} onPress={testNotificationNavigation}>
        <Text style={debugStyles.buttonText}>Test Notification Navigation</Text>
      </TouchableOpacity>
    </View>
  );
};

const debugStyles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    margin: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  smallButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
});