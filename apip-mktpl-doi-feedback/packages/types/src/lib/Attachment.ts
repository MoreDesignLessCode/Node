import { Uuid, IResource } from '@cvshealth/apip-api-types';
import { Nullable } from './Nullable';

export interface IAttachment extends IResource {
    id?: Uuid;
    file_name: string;
    url: string;
    messageId?:Uuid;
}