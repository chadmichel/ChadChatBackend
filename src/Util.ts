import { CommunicationIdentityClient } from '@azure/communication-identity';
import { UserStorage } from './UserStorage';
import { ChatStorage } from './ChatStorage';
import { ChatClient } from '@azure/communication-chat';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

let connectionString = process.env['ChatConnectionString'];
let connectionStringChatEndpoint = process.env['ChatConnectionStringEndpoint'];
let tableStorageConnnString = process.env['TableStorageConnectionString'];

let util = {
  chatConnection: connectionString,
  chatEndpoint: connectionStringChatEndpoint,
  tableConnection: tableStorageConnnString,
  getUserStorage: function () {
    return new UserStorage(tableStorageConnnString);
  },
  getChatStorage: function () {
    return new UserStorage(tableStorageConnnString);
  },
  getIdentityClient: function () {
    return new CommunicationIdentityClient(connectionString);
  },
};

export class Util {
  static getUserStorage(): UserStorage {
    return new UserStorage(tableStorageConnnString);
  }
  static getChatStorage(): ChatStorage {
    return new ChatStorage(tableStorageConnnString);
  }
  static getIdentityClient(): CommunicationIdentityClient {
    return new CommunicationIdentityClient(connectionString);
  }
  static getChatClient(token: string): ChatClient {
    const tokenCredential = new AzureCommunicationTokenCredential(token);
    return new ChatClient(connectionStringChatEndpoint, tokenCredential);
  }
}
