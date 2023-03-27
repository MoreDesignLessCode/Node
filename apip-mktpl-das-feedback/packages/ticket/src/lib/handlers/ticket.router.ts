import { FastifyHttpProvider, IHandler } from '@cvshealth/apip-api-types';

export class TicketRouter {
    constructor(runtime: FastifyHttpProvider, tickethandler: IHandler) {
        runtime.instance.get('/tickets', tickethandler.get);

        runtime.instance.post('/tickets', tickethandler.post);

        runtime.instance.get('/tickets/:id', tickethandler.get);

        runtime.instance.put('/tickets/:id', tickethandler.put);

        runtime.instance.patch('/tickets/:id', tickethandler.put);

        runtime.instance.delete('/tickets/:id', tickethandler.delete);
    }
}
