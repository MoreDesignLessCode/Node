import { IMessage } from '@cvshealth/apip-mktpl-doi-feedback-types';
import { Uuid } from '@cvshealth/apip-api-types';
import * as Joi from 'joi';

export const MessageSchema = Joi.object({
    id: Joi.string().uuid(),
    summary: Joi.string().allow(null),
    description: Joi.string().required(),
    attachments: Joi.array(),
    status: Joi.string(),
    artifactIdValue:Joi.string().uuid(),
    artifactType: Joi.string(),
    createdBy: Joi.string(),  // TODO  : need to change to UUID
})

class Attachmentids {
    id: Uuid;
}

export class Messages implements IMessage {
    id?: Uuid;
    summary!: string;
    description!: string;
    attachments?: Attachmentids[];
    status!: string;
    createdBy!: string;
    artifactIdValue?:Uuid;
    artifactType?:string;

  

}

