import { FastifyHttpProvider, IHandler } from '@cvshealth/apip-api-types';

export  class RatingRouter{
    constructor(runtime: FastifyHttpProvider, ratingsHandler: IHandler) {
        //endponts for ratings
        runtime.instance.get('/ratings', ratingsHandler.get);

        runtime.instance.post('/ratings', ratingsHandler.post);

        runtime.instance.get('/ratings/:id', ratingsHandler.get);

        runtime.instance.put('/ratings/:id', ratingsHandler.put);

        runtime.instance.patch('/ratings/:id', ratingsHandler.put);

        runtime.instance.delete('/ratings/:id', ratingsHandler.delete);
    }
}