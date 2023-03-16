import { IPerson, Nullable } from '@procter-gamble/apip-mktpl-das-person-types';
import { IResource, Uuid } from '@procter-gamble/apip-api-types';
import * as Joi from 'joi';

export const PersonSchema = Joi.object({
    id: Joi.string().allow('').allow(null).uuid(),
    name: Joi.object({
        display: Joi.string(),
        given: Joi.string(),
        middle: Joi.string().allow('').allow(null),
        family: Joi.string(),
    }),
}).meta({ className: 'Person' });

export class Person implements IPerson {
    id?: Nullable<Uuid>;
    name!: Name;

    constructor(id: Uuid, name: Name) {
        this.id = id;
        this.name = name;
    }
}

export class Name implements IResource {
    given: string | undefined;
    middle?: Nullable<string>;
    family: string | undefined;
    display: string;

    constructor(given: string, family: string, middle?: string) {
        this.given = given;
        this.family = family;
        this.middle = middle;
        this.display = ((): string => {
            if (this.middle) {
                return `${this.given} ${this.middle} ${this.family}`;
            } else {
                return `${this.given} ${this.family}`;
            }
        })();
    }
}
