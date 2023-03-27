import { ITicket, Nullable } from '@cvshealth/apip-mktpl-das-feedback-types';
import { Uuid } from '@cvshealth/apip-api-types';
import * as Joi from 'joi';
//import {ParticipantSchema} from '../../../../participant/src/lib/models/participant'
//import {MessageSchema} from '../../../../message/src/lib/models/message'

export const TicketSchema = Joi.object({
    id: Joi.string().allow('').allow(null).uuid(),
    participants: Joi.array().required(),
    messages: Joi.object().required(),
    tags: Joi.array()
}).meta({ className: 'Ticket' });

class Participants {
    id?: Uuid;
    addedBy?: Nullable<Uuid>;
    status!: string;
    ticketId?: Uuid;
    profile_id?: Uuid;
    createdBy?: Uuid;
}

export class Message {
    id?: Uuid;
    summary!: Nullable<string>;
    description!: string;
    attachments?: Attachments[];
    status?: string;
    createdBy?: string;

}

class Attachments {
    id?: Uuid;
    file_name!: string;
    url!: string;
    messageId?: Uuid;

}
export class Tickets implements ITicket {
    id?: Uuid;
    status?: string;
    createdBy?: Uuid;
    summary?: string;
    description?: string;
    participants?: Participants[];
    messages?: Message | Message[];
    messageIds?: Uuid[];
    participantIds?: Uuid[];
    attachmentIds?:Uuid[];
    attachments?:Attachments[];


    constructor(id: Uuid, createdBy: Uuid, status: string, summary: string, description: string, 
        messageIds: Uuid[], participantsIds: Uuid[], attachmentIds: Uuid[],
        messages: Message, participants: Participants[],attachments:Attachments[]) {
        this.id = id;
        this.createdBy = createdBy;
        this.status = status;
        this.summary = summary;
        this.description = description;
        this.messageIds = messageIds;
        this.participantIds = participantsIds;
        this.attachmentIds=attachmentIds;
        this.messages = messages;
        this.participants = participants;
        this.attachments=attachments


    }

}

