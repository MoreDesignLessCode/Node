import { Uuid, IResource } from '@cvshealth/apip-api-types';
import { Nullable } from './Nullable';

export interface IRating extends IResource {
    id?: Uuid;
    rating?:number;
    createdBy?: Uuid;
}