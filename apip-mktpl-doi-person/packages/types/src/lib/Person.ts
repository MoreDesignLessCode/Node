import { Uuid, IResource } from '@procter-gamble/apip-api-types';
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
