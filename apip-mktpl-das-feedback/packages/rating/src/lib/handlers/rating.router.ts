import { FastifyHttpProvider, IHandler } from '@cvshealth/apip-api-types';

export class RatingRouter {
    constructor(runtime: FastifyHttpProvider, ratingHandler: IHandler) {
        runtime.instance.get('/ratings', ratingHandler.get);

        runtime.instance.post('/ratings', ratingHandler.post);

        runtime.instance.get('/ratings/:id', ratingHandler.get);

        runtime.instance.put('/ratings/:id', ratingHandler.put);

        runtime.instance.patch('/ratings/:id', ratingHandler.put);

        runtime.instance.delete('/ratings/:id', ratingHandler.delete);
    }
}
