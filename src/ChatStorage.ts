import { TableClient, TableServiceClient } from '@azure/data-tables';

export class ChatStorage {
  private connectionString: string;
  private defaultChatGroup: string = 'threads';

  constructor(connectionString) {
    this.connectionString = connectionString;
  }

  createTableServiceClient(): TableServiceClient {
    const client = TableServiceClient.fromConnectionString(
      this.connectionString
    );
    return client;
  }

  createTableClient(tableName: string): TableClient {
    const tableClient = TableClient.fromConnectionString(
      this.connectionString,
      tableName
    );
    return tableClient;
  }

  createChatThread(chatThread: ChatThread) {
    const tableClient = this.createTableClient('threads');
    tableClient.createEntity({
      partitionKey: this.defaultChatGroup,
      rowKey: chatThread.threadId,
      topic: chatThread.topic,
      createdTime: chatThread.createdTime,
      createdByUserId: chatThread.createdByUserId,
      createdByEmail: chatThread.createdByEmail,
      invitedUserId: chatThread.invitedUserId,
      invitedUserEmail: chatThread.invitedUserEmail,
      lastMessageTime: chatThread.lastMessageTime,
      lastMessage: chatThread.lastMessage,
      lastMessageSenderUserId: chatThread.lastMessageSenderUserId,
      lastMessageSenderEmail: chatThread.lastMessageSenderEmail,
      members: JSON.stringify(chatThread.members),
      profanity: chatThread.profanity,
    });
    tableClient.createEntity({
      partitionKey: chatThread.createdByUserId,
      rowKey: chatThread.threadId,
      topic: chatThread.topic,
      createdTime: chatThread.createdTime,
      createdByUserId: chatThread.createdByUserId,
      createdByEmail: chatThread.createdByEmail,
      invitedUserId: chatThread.invitedUserId,
      invitedUserEmail: chatThread.invitedUserEmail,
      lastMessageTime: chatThread.lastMessageTime,
      lastMessage: chatThread.lastMessage,
      lastMessageSenderUserId: chatThread.lastMessageSenderUserId,
      lastMessageSenderEmail: chatThread.lastMessageSenderEmail,
      members: JSON.stringify(chatThread.members),
      profanity: chatThread.profanity,
    });
    tableClient.createEntity({
      partitionKey: chatThread.invitedUserId,
      rowKey: chatThread.threadId,
      topic: chatThread.topic,
      createdTime: chatThread.createdTime,
      createdByUserId: chatThread.createdByUserId,
      createdByEmail: chatThread.createdByEmail,
      invitedUserId: chatThread.invitedUserId,
      invitedUserEmail: chatThread.invitedUserEmail,
      lastMessageTime: chatThread.lastMessageTime,
      lastMessage: chatThread.lastMessage,
      lastMessageSenderUserId: chatThread.lastMessageSenderUserId,
      lastMessageSenderEmail: chatThread.lastMessageSenderEmail,
      members: JSON.stringify(chatThread.members),
      profanity: chatThread.profanity,
    });
  }

  async getChatThreadById(id: string): Promise<ChatThread> {
    const tableClient = this.createTableClient('threads');
    const result = await tableClient.getEntity(this.defaultChatGroup, id);
    return {
      threadId: result.rowKey,
      topic: result.topic as string,
      createdTime: result.createdTime as Date,
      createdByUserId: result.createdByUserId as string,
      createdByEmail: result.createdByEmail as string,
      invitedUserId: result.invitedUserId as string,
      invitedUserEmail: result.invitedUserEmail as string,
      lastMessageTime: result.lastMessageTime as Date,
      lastMessage: result.lastMessage as string,
      lastMessageSenderUserId: result.lastMessageSenderUserId as string,
      lastMessageSenderEmail: result.lastMessageSenderEmail as string,
      members: result.members as ChatUser[],
      profanity: result.profanity as boolean,
    };
  }

  async getChats(userId: string): Promise<ChatThread[]> {
    const tableClient = this.createTableClient('threads');
    const query = `PartitionKey eq '${userId}'`;
    const result = tableClient.listEntities({
      queryOptions: { filter: query },
    });
    const chatThreads: ChatThread[] = [];
    for await (const entity of result) {
      console.log(entity.rowKey);
      chatThreads.push({
        threadId: entity.rowKey,
        topic: entity.topic as string,
        createdTime: entity.createdTime as Date,
        createdByUserId: entity.createdByUserId as string,
        createdByEmail: entity.createdByEmail as string,
        invitedUserId: entity.invitedUserId as string,
        invitedUserEmail: entity.invitedUserEmail as string,
        lastMessageTime: entity.lastMessageTime as Date,
        lastMessage: entity.lastMessage as string,
        lastMessageSenderUserId: entity.lastMessageSenderUserId as string,
        lastMessageSenderEmail: entity.lastMessageSenderEmail as string,
        members: entity.members as ChatUser[],
        profanity: entity.profanity as boolean,
      });
    }
    return chatThreads;
  }

  logMessage(
    chatTheadId: string,
    message: string,
    fromUserId: string,
    fromUserEmail: string,
    profanity: boolean
  ) {
    const tableClient = this.createTableClient('messages');
    tableClient.createEntity({
      partitionKey: chatTheadId,
      rowKey: new Date().getTime().toString(),
      message: message,
      fromUserId: fromUserId,
      fromUserEmail: fromUserEmail,
      profanity: profanity,
    });
  }
}

export interface ChatUser {
  userId: string;
  email: string;
  lastReadTime: Date;
}

export interface ChatThread {
  threadId: string;
  topic: string;
  createdTime: Date;
  createdByUserId: string;
  createdByEmail: string;
  invitedUserId: string;
  invitedUserEmail: string;
  members: ChatUser[];
  lastMessageTime: Date;
  lastMessage: string;
  lastMessageSenderUserId: string;
  lastMessageSenderEmail: string;
  profanity: boolean;
}
