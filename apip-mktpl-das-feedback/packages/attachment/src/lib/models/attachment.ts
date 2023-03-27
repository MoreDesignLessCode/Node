import { IAttachment } from '@cvshealth/apip-mktpl-das-feedback-types';
import { IResource, Uuid } from '@cvshealth/apip-api-types';
import * as Joi from 'joi';

export const AttachmentsSchema =Joi.object({
    id: Joi.string().uuid(),
    messageId: Joi.string().uuid(),
    file_name:Joi.string().required(),
    url: Joi.string().required(),  // TODO  : need to change to UUID
  }).meta({clasName :'Attachment'})

  export class Attachments implements IAttachment {
      id?: Uuid;
      file_name?: string;
      url?: string;
      messageId?:Uuid;
      content?:string;
    }