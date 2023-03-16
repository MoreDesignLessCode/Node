import { FastifyHttpProvider, IHandler } from '@procter-gamble/apip-api-types';

export class ContactRouter {
    constructor(runtime: FastifyHttpProvider, contactHandler: IHandler) {
        runtime.instance.get('/contacts', contactHandler.get);

        runtime.instance.post('/contacts', contactHandler.post);

        runtime.instance.get('/contacts/:id', contactHandler.get);

        runtime.instance.put('/contacts/:id', contactHandler.put);

        runtime.instance.patch('/contacts/:id', contactHandler.put);

        runtime.instance.delete('/contacts/:id', contactHandler.delete);
    }
}
