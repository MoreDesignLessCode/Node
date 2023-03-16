import {
    Uuid,
    Result,
    IStorageProvider,
    IContext,
} from '@procter-gamble/apip-api-types';
import { Person } from '../../models';
import { handleResourceNotFoundError } from '../../utils';

export class PersonMemoryStorageProvider implements IStorageProvider<Person> {
    persons: Person[];

    constructor(testData: Person[]) {
        this.persons = testData;
    }

    save = async (
        id: Uuid,
        entity: Person,
        _context: IContext
    ): Promise<Result<Person>> => {
        const result = this.persons.find((person: Person) => {
            return person.id === id;
        });

        if (result != undefined) {
            const index = this.persons.indexOf(result, 0);
            this.persons[index] = entity;
            return {
                type: 'ok',
                data: { type: 'resource', value: entity },
            };
        } else {
            return handleResourceNotFoundError(id);
        }
    };

    delete = async (id: Uuid, _context: IContext): Promise<Result<Person>> => {
        const result = this.persons.find((person: Person) => {
            return person.id === id;
        });
        if (result != undefined) {
            const index = this.persons.indexOf(result, 0);
            this.persons.splice(index, 1);
            return {
                type: 'ok',
                data: { type: 'resource', value: result },
            };
        } else {
            return handleResourceNotFoundError(id);
        }
    };

    all = async (_context: IContext): Promise<Result<Person>> => ({
        type: 'ok',
        data: { type: 'collection', value: this.persons },
    });

    findById = async (
        id: Uuid,
        _context: IContext
    ): Promise<Result<Person>> => {
        const result = this.persons.find((person: Person) => {
            return person.id === id;
        });

        if (result) {
            return {
                type: 'ok',
                data: { type: 'resource', value: result },
            };
        }

        return handleResourceNotFoundError(id);
    };

    create = async (
        object: Person,
        _context: IContext
    ): Promise<Result<Person>> => {
        this.persons.push(object);
        return {
            type: 'ok',
            data: { type: 'resource', value: object },
        };
    };
}
