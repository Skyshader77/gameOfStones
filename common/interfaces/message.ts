export class Message  {
    message:String
    time:Date
  }
  
export class JournalMessage {
    message:Message;
    isPrivate:boolean;
}
  
export class ChatMessage {
    message:Message;
    author:number;
}