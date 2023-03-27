import { IPerson, Nullable } from '@cvshealth/apip-mktpl-doi-person-types';
import { Uuid } from '@cvshealth/apip-api-types';
import * as Joi from 'joi';

export const PersonSchema = Joi.object({
    id: Joi.string().allow('').allow(null).uuid(),
    name: Joi.object({
        display: Joi.string().allow('').allow(null),
        given: Joi.string(),
        middle: Joi.string().allow('').allow(null),
        family: Joi.string(),
    }),
}).meta({ className: 'Person' });

export class Person implements IPerson {
    id?: Nullable<Uuid>;
    name: {
        display?: string;
        given: string;
        middle?: Nullable<string>;
        family: string;
    };
}
