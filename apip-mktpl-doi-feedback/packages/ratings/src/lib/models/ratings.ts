import { IRating , Nullable} from '@cvshealth/apip-mktpl-doi-feedback-types';
import { Uuid } from '@cvshealth/apip-api-types';
import * as Joi from 'joi';


export const RatingSchema =Joi.object({
    id: Joi.string().allow('').allow(null).uuid(),
    artifactId:Joi.string().uuid(),
    rating: Joi.number(),
    status: Joi.string(),
    createdBy: Joi.string().allow('').allow(null).uuid(),
    participants: Joi.array().required(),
    messages:Joi.object().required(),

    // messages:Joi.array().required(),
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
export class Ratings implements IRating {
    id?: Uuid;
    artifactId?:Uuid;
    status?: string;
    createdBy?: Uuid;
    participants!: Participants[];
    messages!: Message[];

}
