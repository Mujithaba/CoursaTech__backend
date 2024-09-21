export interface IMessage {
    senderId: string;
    receiverId: string;
    message: string;
    createdAt?: Date;
}