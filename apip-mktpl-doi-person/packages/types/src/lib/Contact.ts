import { Uuid, IResource } from '@procter-gamble/apip-api-types';
import { Nullable } from './Nullable';

export interface IContact extends IResource {
    id?: Nullable<Uuid>;
    personId: Uuid;
    type: string;
    value: string;
}
