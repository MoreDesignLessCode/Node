import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export type Uuid = string & { readonly _: unique symbol };

export function Uuid(): Uuid {
    return uuidv4() as Uuid;
}

export function parseUuid(uuid: string): Uuid {
    if(uuidValidate(uuid)) return uuid as Uuid;
    throw Error('invalid uuid');
}
