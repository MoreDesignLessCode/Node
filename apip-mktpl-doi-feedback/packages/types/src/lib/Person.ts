import { Uuid, IResource } from '@cvshealth/apip-api-types';
import { Nullable } from './Nullable';

export interface IPerson extends IResource {
    id?: Nullable<Uuid>;
    name: {
        display?: string;
        given: string;
        middle?: Nullable<string>;
        family: string;
    };
}
