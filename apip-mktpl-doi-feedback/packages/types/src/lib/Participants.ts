import { Uuid, IResource } from '@cvshealth/apip-api-types';
import { Nullable } from './Nullable';

export interface IParticipant extends IResource {
    id?: Uuid;
    addedBy?: Nullable<Uuid>;
    status: string;
    ticketId?:Uuid;
}