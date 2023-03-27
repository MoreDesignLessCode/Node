import { FastifyHttpProvider, IHandler } from '@cvshealth/apip-api-types';

export class AttachmentRouter {
    constructor(runtime: FastifyHttpProvider, attachmentHandler: IHandler) {
        runtime.instance.get('/attachments', attachmentHandler.get);

        runtime.instance.post('/attachments', attachmentHandler.post);

        runtime.instance.get('/attachments/:id', attachmentHandler.get);

        runtime.instance.put('/attachments/:id', attachmentHandler.put);

        runtime.instance.patch('/attachments/:id', attachmentHandler.put);

        runtime.instance.delete('/attachments/:id', attachmentHandler.delete);
    }
}
