import {
    IContact,
    Nullable,
} from '@procter-gamble/apip-mktpl-doi-person-types';
import { Uuid } from '@procter-gamble/apip-api-types';
import * as Joi from 'joi';

export const ContactSchema = Joi.object({
    id: Joi.string().allow('').allow(null).uuid(),
    personId: Joi.string().uuid(),
    type: Joi.string(),
    value: Joi.string(),
}).meta({ className: 'Contact' });

export class Contact implements IContact {
    id?: Nullable<Uuid>;
    personId: Uuid;
    type: string;
    value: string;
}
