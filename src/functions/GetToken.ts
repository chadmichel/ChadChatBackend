import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';

import { CommunicationIdentityClient } from '@azure/communication-identity';
import { UserStorage } from '../UserStorage';

let connectionString = process.env['ChatConnectionString'];
let connectionStringChatEndpoint = process.env['ChatConnectionStringEndpoint'];
let tableStorageConnnString = process.env['TableStorageConnectionString'];

console.log('Azure Communication Chat client created!');
export async function GetToken(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`begin: Token "${request.url}"`);

  context.log(connectionString);

  var data = (await request.json()) as any;
  console.log('Data = ' + data);

  // MAJOR ISSUE: The email is not being passed in the request body.
  // We need to pull this from a JWT token or something.
  const email = data.email;
  // No reason to pass in userId in a production scenario.
  let userId = data.userId;

  var userStorage = new UserStorage(tableStorageConnnString);
  const identityClient = new CommunicationIdentityClient(connectionString);

  if (!userId || userId == '') {
    userId = await userStorage.getUserIdByEmail(email);
  }

  let user: any = null;
  if (!userId || userId == '') {
    context.log('Creating new user');

    user = await identityClient.createUser();
    userId = user.communicationUserId;
    userStorage.saveUser(email, userId);
  } else {
    context.log('User already exists');
    user = { communicationUserId: userId };
  }

  const tokenOptions = { tokenExpiresInMinutes: 1440 }; // 1440 minutes in a day
  // https://learn.microsoft.com/en-us/javascript/api/overview/azure/communication-identity-readme?view=azure-node-latest
  const token = await identityClient.getToken(user, ['chat'], tokenOptions);

  const response = JSON.stringify({
    token: token.token,
    expiresOn: token.expiresOn,
    userId: user.communicationUserId,
    email: email,
    endpoint: connectionStringChatEndpoint,
  });
  context.log(`end: Token "${response}"`);
  return {
    body: response,
  };
}

app.http('Init', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: GetToken,
});
