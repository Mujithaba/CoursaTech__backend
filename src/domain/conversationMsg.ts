export interface Conversation {
    senderName:string;
    senderId:string;
    receiverId:string;
    lastMessage:string;
    timestamps?:Date;
}