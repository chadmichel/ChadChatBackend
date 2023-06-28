import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { Util } from '../Util';

var Filter = require('bad-words'),
  filter = new Filter();

export async function LogMessage(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  var data = (await request.json()) as any;

  var token = request.headers.get('token');
  var fromUserId = request.headers.get('userId');
  var formUserEmail = request.headers.get('userEmail');

  var message = filter.clean(data.message);
  var threadId = data.threadId;

  const chatStorage = Util.getChatStorage();
  chatStorage.logMessage(threadId, message, fromUserId, formUserEmail, false);

  var response = {
    message: message,
    threadId: threadId,
  };

  return { body: JSON.stringify(response) };
}

app.http('LogMessage', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: LogMessage,
});
