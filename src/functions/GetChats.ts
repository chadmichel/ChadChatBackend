import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { Util } from '../Util';

export async function GetChats(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`
  begin: GetChats "${request.url}"`);

  var token = request.headers.get('Token');
  var userId = request.headers.get('UserId');

  const chatClient = Util.getChatClient(token);
  const chatThreads = await chatClient.listChatThreads();
  const threads = [];
  for await (const chatThread of chatThreads) {
    threads.push(chatThread.id);
  }
  const chatStorage = Util.getChatStorage();
  var chats = await chatStorage.getChats(userId);

  // remove threads we don't have access to
  chats = chats.filter((c) => threads.indexOf(c.threadId) >= 0);

  const response = JSON.stringify(chats);

  context.log(`
  end: GetChats "${response}"`);

  return { body: response };
}

app.http('GetChats', {
  methods: ['GET'],
  authLevel: 'function',
  handler: GetChats,
});
