export interface Conversation {
  senderName: string;
  instructorName?: string;
  senderId: string;
  receiverId: string;
  lastMessage: string;
  timestamps?: Date;
}
