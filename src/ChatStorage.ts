import { TableClient, TableServiceClient } from '@azure/data-tables';

export class ChatStorage {
  private connectionString: string;
  private defaultChatGroup: string = 'threads';

  private conversationTableName = 'conversations';
  private messagesTableName = 'messages';

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

  createChatThread(conversation: Converation) {
    // We are 3x storing the data to improve query performance
    const tableClient = this.createTableClient(this.conversationTableName);
    tableClient.createEntity({
      partitionKey: this.defaultChatGroup,
      rowKey: conversation.conversationId,
      topic: conversation.topic,
      createdTime: conversation.createdTime,
      createdByUserId: conversation.createdByUserId,
      createdByEmail: conversation.createdByEmail,
      invitedUserId: conversation.invitedUserId,
      invitedUserEmail: conversation.invitedUserEmail,
      lastMessageTime: conversation.lastMessageTime,
      lastMessage: conversation.lastMessage,
      lastMessageSenderUserId: conversation.lastMessageSenderUserId,
      lastMessageSenderEmail: conversation.lastMessageSenderEmail,
      members: JSON.stringify(conversation.members),
      profanity: conversation.profanity,
    });
    tableClient.createEntity({
      partitionKey: conversation.createdByUserId,
      rowKey: conversation.conversationId,
      topic: conversation.topic,
      createdTime: conversation.createdTime,
      createdByUserId: conversation.createdByUserId,
      createdByEmail: conversation.createdByEmail,
      invitedUserId: conversation.invitedUserId,
      invitedUserEmail: conversation.invitedUserEmail,
      lastMessageTime: conversation.lastMessageTime,
      lastMessage: conversation.lastMessage,
      lastMessageSenderUserId: conversation.lastMessageSenderUserId,
      lastMessageSenderEmail: conversation.lastMessageSenderEmail,
      members: JSON.stringify(conversation.members),
      profanity: conversation.profanity,
    });
    tableClient.createEntity({
      partitionKey: conversation.invitedUserId,
      rowKey: conversation.conversationId,
      topic: conversation.topic,
      createdTime: conversation.createdTime,
      createdByUserId: conversation.createdByUserId,
      createdByEmail: conversation.createdByEmail,
      invitedUserId: conversation.invitedUserId,
      invitedUserEmail: conversation.invitedUserEmail,
      lastMessageTime: conversation.lastMessageTime,
      lastMessage: conversation.lastMessage,
      lastMessageSenderUserId: conversation.lastMessageSenderUserId,
      lastMessageSenderEmail: conversation.lastMessageSenderEmail,
      members: JSON.stringify(conversation.members),
      profanity: conversation.profanity,
    });
  }

  async updateLastMessage(
    threadId: string,
    message: string,
    fromUserId: string,
    fromUserEmail: string,
    profanity: boolean
  ) {
    // Since we 3x store the data for query purposes we need to update 3x the copies.
    const tableClient = this.createTableClient(this.conversationTableName);
    let result = await tableClient.getEntity(this.defaultChatGroup, threadId);
    if (result) {
      await tableClient.upsertEntity({
        partitionKey: this.defaultChatGroup,
        rowKey: threadId,
        topic: result.topic,
        createdTime: result.createdTime,
        createdByUserId: result.createdByUserId,
        createdByEmail: result.createdByEmail,
        invitedUserId: result.invitedUserId,
        invitedUserEmail: result.invitedUserEmail,
        lastMessageTime: new Date(),
        lastMessage: message,
        lastMessageSenderUserId: fromUserId,
        lastMessageSenderEmail: fromUserEmail,
        members: result.members,
        profanity: profanity,
      });
      var createdById = result.createdByUserId as string;
      var invitedById = result.invitedUserId as string;
      result = await tableClient.getEntity(createdById, threadId);
      if (result) {
        await tableClient.upsertEntity({
          partitionKey: createdById,
          rowKey: threadId,
          topic: result.topic,
          createdTime: result.createdTime,
          createdByUserId: result.createdByUserId,
          createdByEmail: result.createdByEmail,
          invitedUserId: result.invitedUserId,
          invitedUserEmail: result.invitedUserEmail,
          lastMessageTime: new Date(),
          lastMessage: message,
          lastMessageSenderUserId: fromUserId,
          lastMessageSenderEmail: fromUserEmail,
          members: result.members,
          profanity: profanity,
        });
      }
      result = await tableClient.getEntity(invitedById, threadId);
      if (result) {
        await tableClient.upsertEntity({
          partitionKey: invitedById,
          rowKey: threadId,
          topic: result.topic,
          createdTime: result.createdTime,
          createdByUserId: result.createdByUserId,
          createdByEmail: result.createdByEmail,
          invitedUserId: result.invitedUserId,
          invitedUserEmail: result.invitedUserEmail,
          lastMessageTime: new Date(),
          lastMessage: message,
          lastMessageSenderUserId: fromUserId,
          lastMessageSenderEmail: fromUserEmail,
          members: result.members,
          profanity: profanity,
        });
      }
    }
  }

  async getChatThreadById(id: string): Promise<Converation> {
    const tableClient = this.createTableClient(this.conversationTableName);
    const result = await tableClient.getEntity(this.defaultChatGroup, id);
    return {
      conversationId: result.rowKey,
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

  async getChats(userId: string): Promise<Converation[]> {
    // We store a custom version of each chat for each user.
    // This allows us to query by partition key for that user.
    const tableClient = this.createTableClient(this.conversationTableName);
    const query = `PartitionKey eq '${userId}'`;
    const result = tableClient.listEntities({
      queryOptions: { filter: query },
    });
    const chatThreads: Converation[] = [];
    for await (const entity of result) {
      console.log(entity.rowKey);
      chatThreads.push({
        conversationId: entity.rowKey,
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
    const tableClient = this.createTableClient(this.messagesTableName);
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

export interface Converation {
  conversationId: string;
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
