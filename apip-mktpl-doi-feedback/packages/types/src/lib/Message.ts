import { Uuid, IResource } from '@cvshealth/apip-api-types';
import { Nullable } from './Nullable';

export interface IMessage extends IResource {
    id?: Uuid;
    summary: Nullable<string>;
    description: string;
    status: string;
    createdBy: string;
}