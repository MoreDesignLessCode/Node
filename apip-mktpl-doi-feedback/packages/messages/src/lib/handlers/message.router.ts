import { FastifyHttpProvider, IHandler } from '@cvshealth/apip-api-types';

export class MessagesRouter {
    constructor(runtime: FastifyHttpProvider, messagesHandler: IHandler) {
        //endponts for messages
        runtime.instance.get('/messages', messagesHandler.get);

        runtime.instance.post('/messages', messagesHandler.post);

        runtime.instance.get('/messages/:id', messagesHandler.get);

        runtime.instance.put('/messages/:id', messagesHandler.put);

        // runtime.instance.patch('/messages/:id', messagesHandler.put);
        runtime.instance.patch('/messages', messagesHandler.put);

        runtime.instance.delete('/messages/:id', messagesHandler.delete);
    }
}