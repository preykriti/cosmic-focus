import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  Unsubscribe,
  orderBy,
  limit 
} from '@react-native-firebase/firestore';
import { displayNotification } from '../firebase/notifications/notificationHandler';
import { FocusSession } from '../firebase/firestore/focusSession';

class BackgroundInviteListener {
  private unsubscribe: Unsubscribe | null = null;
  private currentUserId: string | null = null;
  private processedInvitations = new Set<string>(); 

  public startListening(userId: string) {
    if (this.currentUserId === userId && this.unsubscribe) {
      return;
    }

    this.stopListening();
    this.currentUserId = userId;
    
    if (!this.processedInvitations.size) {
      console.log('First time setup - will process only new invitations');
    }

    console.log(' Starting background invite listener for user:', userId);

    const firestore = getFirestore();
    
    // Listen to all recent group sessions and filter client-side
    const recentGroupSessionsQuery = query(
      collection(firestore, 'focusSessions'),
      where('sessionMode', '==', 'group'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    this.unsubscribe = onSnapshot(
      recentGroupSessionsQuery,
      (snapshot) => {
        console.log('Background listener: received', snapshot.docs.length, 'group sessions');
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            console.log(`Processing ${change.type} document:`, change.doc.id);
            this.processSessionChange(change.doc.id, change.doc.data() as FocusSession);
          }
        });
      },
      (error) => {
        console.error(' Background invite listener error:', error);
        setTimeout(() => {
          if (this.currentUserId === userId) {
            console.log('Retrying background listener...');
            this.startListening(userId);
          }
        }, 5000);
      }
    );
  }

  private processSessionChange(sessionId: string, sessionData: FocusSession) {
    if (!this.currentUserId) return;

    console.log('Processing session change for:', sessionId, 'User:', this.currentUserId);
    console.log('Session participants:', sessionData.participants?.map(p => ({ userId: p.userId, status: p.status })));

    // check if current user is in participants with 'invited' status
    const userParticipant = sessionData.participants?.find(
      p => p.userId === this.currentUserId && p.status === 'invited'
    );

    console.log('Found user participant:', userParticipant);

    if (userParticipant) {
      const inviteKey = `${sessionId}-${this.currentUserId}`;
      console.log('Checking invite key:', inviteKey);
      console.log('Already processed invitations:', Array.from(this.processedInvitations));
      
      // only show notification if we haven't processed this invitation yet
      if (!this.processedInvitations.has(inviteKey)) {
        console.log('NEW INVITATION DETECTED! Session:', sessionId);
        
        displayNotification(
          'Group Focus Invite',
          `You have been invited to join: ${sessionData.groupName || 'Focus Session'}`,
          { sessionId }
        ).then(() => {
          console.log('Invitation notification sent successfully');
        }).catch((error) => {
          console.error('Failed to send notification:', error);
        });
        
        this.processedInvitations.add(inviteKey);
        console.log('Added to processed invitations:', inviteKey);

        if (this.processedInvitations.size > 100) {
          const invitesToKeep = Array.from(this.processedInvitations).slice(-50);
          this.processedInvitations = new Set(invitesToKeep);
        }
      } else {
        console.log('Invitation already processed for:', inviteKey);
      }
    } else {
      console.log('No matching invitation found for user:', this.currentUserId);
    }
  }

  public stopListening() {
    if (this.unsubscribe) {
      console.log('Stopping background invite listener');
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.currentUserId = null;
    this.processedInvitations.clear();
  }

  public updateUserId(newUserId: string) {
    if (this.currentUserId !== newUserId) {
      console.log('Updating background listener for new user:', newUserId);
      this.startListening(newUserId);
    }
  }

  // method to manually trigger a check
  public triggerManualCheck() {
    console.log('Manual check triggered, processed invitations:', this.processedInvitations.size);
    return {
      isListening: !!this.unsubscribe,
      currentUserId: this.currentUserId,
      processedCount: this.processedInvitations.size
    };
  }
}

export const backgroundInviteListener = new BackgroundInviteListener();