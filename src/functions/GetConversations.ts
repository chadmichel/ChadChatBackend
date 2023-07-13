import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { Util } from '../Util';

export async function GetConversations(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`
  begin: GetConversations "${request.url}"`);

  var token = request.headers.get('Token');
  var userId = request.headers.get('UserId');

  const chatClient = Util.getChatClient(token);
  const chatThreads = await chatClient.listChatThreads();
  const conversations = [];
  for await (const chatThread of chatThreads) {
    conversations.push(chatThread.id);
  }
  const chatStorage = Util.getChatStorage();
  var chats = await chatStorage.getChats(userId);

  // remove threads we don't have access to
  chats = chats.filter((c) => conversations.indexOf(c.conversationId) >= 0);

  const response = JSON.stringify(chats);

  context.log(`
  end: GetConversations "${response}"`);

  return { body: response };
}

app.http('GetConversations', {
  methods: ['GET'],
  authLevel: 'function',
  handler: GetConversations,
});
