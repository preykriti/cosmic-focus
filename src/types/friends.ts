export type FriendProfile = {
  id: string;
  email: string;
  username: string;
  streak: number;
};

export interface FriendRequest {
  id: string;
  fromUsername: string;
  from: string;
  to: string;
}