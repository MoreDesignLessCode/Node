import { Uuid, IResource } from '@cvshealth/apip-api-types';
import { Nullable } from './Nullable';

export interface ITicket extends IResource {
    id?: Uuid;
    createdBy?: Uuid;
}