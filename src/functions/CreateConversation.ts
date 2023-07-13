import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';

import { Util } from '../Util';

export async function CreateConversation(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`CreateConversation "${request.url}"`);

  var data = (await request.json()) as any;
  console.log('Data = ' + data);

  var token = request.headers.get('token');
  var userId = request.headers.get('userId');
  var email = request.headers.get('userEmail');

  var inviteEmail = data.inviteEmail;

  const userStorage = Util.getUserStorage();
  const chatStorage = Util.getChatStorage();
  const identityClient = Util.getIdentityClient();
  const chatClient = Util.getChatClient(token);

  var inviteUserId = await userStorage.getUserIdByEmail(inviteEmail);
  let invitedUser = null;
  if (inviteUserId == null || inviteUserId == '') {
    invitedUser = await identityClient.createUser();
    inviteUserId = invitedUser.communicationUserId;
    userStorage.saveUser(inviteEmail, inviteUserId);
  }
  const topic = `${email} and ${inviteEmail} chat`;
  const createChatThreadResponse = await chatClient.createChatThread({
    topic: topic,
  });
  const chatThreadId = createChatThreadResponse.chatThread?.id;

  var chatThreadClient = chatClient.getChatThreadClient(chatThreadId);
  chatThreadClient.addParticipants({
    participants: [
      { id: { communicationUserId: inviteUserId }, displayName: inviteEmail },
      { id: { communicationUserId: userId }, displayName: email },
    ],
  });

  chatStorage.createChatThread({
    conversationId: chatThreadId,

    topic: topic,
    createdTime: new Date(),
    createdByUserId: userId,
    createdByEmail: email,
    invitedUserId: inviteUserId,
    invitedUserEmail: inviteEmail,
    members: [],
    lastMessageTime: new Date(),
    lastMessage: '',
    lastMessageSenderUserId: '',
    lastMessageSenderEmail: '',
    profanity: false,
  });

  var response = {
    chatThreadId: chatThreadId,
  };

  context.log('CreateConversation response = ' + JSON.stringify(response));
  return { body: JSON.stringify(response) };
}

app.http('CreateConversation', {
  methods: ['POST'],
  authLevel: 'function',
  handler: CreateConversation,
});
