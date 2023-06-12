import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';

// import { ChatClient } from '@azure/communication-chat';
// import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { CommunicationIdentityClient } from '@azure/communication-identity';

// let endpointUrl = process.env['ChatEndpointUrl'];
// let secretKey = process.env['ChatSecret'];
let connectionString = process.env['ChatConnectionString'];

// let chatClient = new ChatClient(
//   endpointUrl,
//   new AzureCommunicationTokenCredential(secretKey)
// );

console.log('Azure Communication Chat client created!');
export async function GetToken(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  context.log(connectionString);

  const name = request.query.get('name') || (await request.text()) || 'world';

  const identityClient = new CommunicationIdentityClient(connectionString);
  const user = await identityClient.createUser();

  // const token = await identityClient.getToken(user, ['chat']);
  return { body: `Hello, ${name}!` };
}

app.http('GetToken', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: GetToken,
});
