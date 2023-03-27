import {
    Constants,
    formatString,
  
    ResourceNotFoundError,

    Tickets,
} from '../../index';
import {
    parseUuid,
    Uuid,
    Result,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';


export class TicketMemoryStorageProvider implements IStorageProvider<Tickets> {


    ticketSample: Tickets[] = [{
        id: parseUuid('11e62cea-eedd-40e5-8b68-26efe3c47d37'),
        status: "NEW",
        createdBy: parseUuid('11e62cea-eedd-40e5-8b68-26efe3c47d37'),
        messages: [{
            id: parseUuid('11e62cea-eedd-40e5-8b68-26efe3c47d37'),
            summary: "hello",
            status: "new",
            createdBy: parseUuid('11e62cea-eedd-40e5-8b68-26efe3c47d37'),
            description: "hey",
        }],
        participants: [{
            id: parseUuid('11e62cea-eedd-40e5-8b68-26efe3c47d37'),
            status: "Responsible",
        }]
    }, {
        id: parseUuid('2c4c587d-6155-45d1-b6d8-35f7b5501169'),
        status: "NEW",
        createdBy: parseUuid('2c4c587d-6155-45d1-b6d8-35f7b5501169'),
        messages: [{
            id: parseUuid('2c4c587d-6155-45d1-b6d8-35f7b5501169'),
            summary: "hello",
            status: "new",
            createdBy: parseUuid('2c4c587d-6155-45d1-b6d8-35f7b5501169'),
            description: "hey",
        }],
        participants: [{
            id: parseUuid('2c4c587d-6155-45d1-b6d8-35f7b5501169'),
            status: "Responsible",
        }]
    }]

    save = (id: Uuid, entity: Tickets,context:IContext): Promise<Result<Tickets>>   => {
        return new Promise((resolve) => {
            const result = this.ticketSample.find((ticket: Tickets) => {
                return ticket.id === id;
            });

            if (result != undefined) {
                const index = this.ticketSample.indexOf(result, 0);
                this.ticketSample[index] = {...this.ticketSample[index],...entity};
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: this.ticketSample[index] },
                });
            } else {
                const error = new ResourceNotFoundError(
                    Constants.errors.notFound.ticket.CODE
                )
                    .withTitle(Constants.errors.notFound.ticket.TITLE)
                    .withReason(
                        formatString(
                            Constants.errors.notFound.ticket.MESSAGE,
                            id
                        )
                    );

                resolve({ type: 'error', data: error });
            }
        });
    };

    delete = (id: Uuid): Promise<Result<Tickets>> => {
        return new Promise((resolve) => {
            const result = this.ticketSample.find((ticket: Tickets) => {
                return ticket.id === id;
            });
            if (result != undefined) {
                const index = this.ticketSample.indexOf(result, 0);
                this.ticketSample.splice(index, 1);
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: result },
                });
            } else {
                const error = new ResourceNotFoundError(
                    Constants.errors.notFound.ticket.CODE
                )
                    .withTitle(Constants.errors.notFound.ticket.TITLE)
                    .withReason(
                        formatString(
                            Constants.errors.notFound.ticket.MESSAGE,
                            id
                        )
                    );
                resolve({ type: 'error', data: error });
            }
        });
    }

    all = (): Promise<Result<Tickets>> => {
        return new Promise((resolve) => {
            resolve({
                type: 'ok',
                data: { type: 'collection', value: this.ticketSample },
            });
        });
    };

    findById =(id: Uuid, context: IContext): Promise<Result<Tickets>> => {
        return new Promise((resolve) => {
            const result = this.ticketSample.find((ticket: Tickets) => {
                return ticket.id === id;
            });

            if (result) {
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: result },
                });
            }

            const error = new ResourceNotFoundError(
                Constants.errors.notFound.ticket.CODE
            )
                .withTitle(Constants.errors.notFound.ticket.TITLE)
                .withReason(
                    formatString(Constants.errors.notFound.ticket.MESSAGE, id)
                );
            resolve({
                type: 'error',
                data: error,
            });
        });
   
    };

    create = (object: Tickets ,context:IContext):Promise<Result<Tickets>>=> {
       const {messages,participants,...rest}=object
        messages.map(messages=>{
            messages.id=Uuid()
        })
        participants.map(participant=>{
            participant.id=Uuid()
        })

        let newResp={
            ...rest,
            id:Uuid()
        }
        const newObj={
           ...newResp,
            messages,
            participants
        }
        this.ticketSample.push(newObj);
        return new Promise((resolve) => {
            resolve({
                type: 'ok',
                data: { type: 'resource', value: object },
            });
        });
    };

}
