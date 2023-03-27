import { IMessage } from '@cvshealth/apip-mktpl-das-feedback-types';
import {  Uuid } from '@cvshealth/apip-api-types';
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
    status?: string;
    createdBy?: Uuid;
    artifactIdValue?:Uuid;
    artifactType?:string;

    constructor(id: Uuid, summary: string, description: string,status:string, createdBy:Uuid,attachments:Attachmentids[]) {
        this.id = id;
        this.summary = summary;
        this.description=description;
        this.status=status;
        this.createdBy=createdBy;
        this.attachments=attachments
    }

}

