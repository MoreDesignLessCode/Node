import { IRating, Nullable } from '@cvshealth/apip-mktpl-das-feedback-types';
import { Uuid } from '@cvshealth/apip-api-types';
import * as Joi from 'joi';

export const RatingSchema = Joi.object({   
    id: Joi.string().allow('').allow(null).uuid(),
    rating: Joi.number(),
    artifactId:Joi.string().allow('').allow(null).uuid(),
    participants: Joi.array().required(),
    messages:Joi.object().required(),
    tags:Joi.array()
}).meta({ className: 'Rating' });

class Participants  {
    id?: Uuid;
    addedBy?: Nullable<Uuid>;
    status!: string;
    ticketId?:Uuid;
    profile_id?:Uuid;
    createdBy?:Uuid;
}

export class Message  {
    id?: Uuid;
    summary!: Nullable<string>;
    description!: string;
    attachments?: Attachments[];
    status?: string;
    createdBy?: string;

}

class Attachments  {
    id?: Uuid;
    file_name!: string;
    url!: string;
    messageId?:Uuid;
  
  }
export class Ratings implements IRating {
    id?: Uuid;
    rating?:number;
    status?: string;
    createdBy?: Uuid;
    summary?:string;
    description?:string;
    participants?: Participants[];
    messages?: Message|Message[];
    messageIds?:Uuid[];
    participantIds?:Uuid[];


    constructor(id:Uuid,rating:number,createdBy:Uuid,status:string,summary:string,description:string,messageIds:Uuid[],participantsIds:Uuid[],messages:Message,participants:Participants[]){
     this.id=id;
     this.rating=rating;
     this.createdBy=createdBy;
     this.status=status;
     this.summary=summary;
     this.description=description;
     this.messageIds=messageIds;
     this.participantIds=participantsIds;
     this.messages=messages;
     this.participants=participants;
   
    }

}

