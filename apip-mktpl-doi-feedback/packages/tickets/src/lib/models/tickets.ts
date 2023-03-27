import { ITicket , Nullable} from '@cvshealth/apip-mktpl-doi-feedback-types';
import { Uuid } from '@cvshealth/apip-api-types';
import * as Joi from 'joi';


export const TicketSchema =Joi.object({
    id: Joi.string().allow('').allow(null).uuid(),
    participants: Joi.array().required(),
    messages:Joi.object().required(),
    tags:Joi.array()
})

class Participants  {
    id?: Uuid;
    addedBy?: Nullable<Uuid>;
    status!: string;
    ticketId?:Uuid;
}

class Message  {
    id?: Uuid;
    summary!: Nullable<string>;
    description!: string;
    attachments?: Attachments[];
    status!: string;
    createdBy!: string;

}

class Attachments  {
    id?: Uuid;
    file_name!: string;
    url!: string;
    messageId?:Uuid;
  
  }
export class Tickets implements ITicket {
    id?: Uuid;
    status?: string;
    createdBy?: Uuid;
    participants!: Participants[];
    messages!: Message[];

}
