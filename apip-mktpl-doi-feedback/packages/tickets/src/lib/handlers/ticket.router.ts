import { FastifyHttpProvider, IHandler } from '@cvshealth/apip-api-types';

export  class TicketRouter{
    constructor(runtime: FastifyHttpProvider, ticketsHandler: IHandler) {
        //endponts for tickets
        runtime.instance.get('/tickets', ticketsHandler.get);

        runtime.instance.post('/tickets', ticketsHandler.post);

        runtime.instance.get('/tickets/:id', ticketsHandler.get);

        runtime.instance.put('/tickets/:id', ticketsHandler.put);

        runtime.instance.patch('/tickets/:id', ticketsHandler.put);

        runtime.instance.delete('/tickets/:id', ticketsHandler.delete);
    }
}