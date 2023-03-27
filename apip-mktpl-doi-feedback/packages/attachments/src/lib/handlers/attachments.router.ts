import { FastifyHttpProvider, IHandler } from '@cvshealth/apip-api-types';

export class AttachmentsRouter{
    constructor(runtime:FastifyHttpProvider,attachmentsHandler:IHandler){
        runtime.instance.get('/attachments', attachmentsHandler.get);

        runtime.instance.post('/attachments', attachmentsHandler.post);

        runtime.instance.get('/attachments/:id', attachmentsHandler.get);

        runtime.instance.put('/attachments/:id', attachmentsHandler.put);

        runtime.instance.patch('/attachments/:id', attachmentsHandler.put);

        runtime.instance.delete('/attachments/:id', attachmentsHandler.delete);
    }
}