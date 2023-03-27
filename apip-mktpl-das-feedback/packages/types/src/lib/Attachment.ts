import { Uuid, IResource } from '@cvshealth/apip-api-types';

export interface IAttachment extends IResource {
    id?: Uuid;
    file_name?: string;
    url?: string;
    messageId?:Uuid;
}