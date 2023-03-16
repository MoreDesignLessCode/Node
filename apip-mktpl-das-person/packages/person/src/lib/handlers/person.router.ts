import { FastifyHttpProvider, IHandler } from '@procter-gamble/apip-api-types';

export class PersonRouter {
    constructor(runtime: FastifyHttpProvider, personHandler: IHandler) {
        runtime.instance.get('/persons', personHandler.get);

        runtime.instance.post('/persons', personHandler.post);

        runtime.instance.get('/persons/:id', personHandler.get);

        runtime.instance.put('/persons/:id', personHandler.put);

        runtime.instance.patch('/persons/:id', personHandler.put);

        runtime.instance.delete('/persons/:id', personHandler.delete);
    }
}
