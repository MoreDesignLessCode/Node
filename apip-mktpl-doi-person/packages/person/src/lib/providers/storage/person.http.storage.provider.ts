import {
    Uuid,
    Result,
    IStorageProvider,
    IContext,
} from '@procter-gamble/apip-api-types';
import { Person } from '../../models';
import { handleResourceNotFoundError } from '../../utils';

export class PersonHttpStorageProvider implements IStorageProvider<Person> {
    baseUrl = process.env.PERSON_DAS_BASE_URL;

    save = async (
        id: Uuid,
        entity: Person,
        context: IContext
    ): Promise<Result<Person>> => {
        const response = await getData(
            context,
            id,
            entity,
            this.baseUrl,
            'PUT'
        );
        const data = await response.json();
        if (data.code) {
            return handleResourceNotFoundError(id);
        }

        return {
            type: 'ok',
            data: { type: 'resource', value: data },
        };
    };

    delete = async (id: Uuid, context: IContext): Promise<Result<Person>> => {
        const response = await getData(
            context,
            id,
            null,
            this.baseUrl,
            'DELETE'
        );
        if (response.status === 204) {
            return {
                type: 'ok',
                data: { type: 'resource', value: null },
            };
        }

        return handleResourceNotFoundError(id);
    };

    all = async (context: IContext): Promise<Result<Person>> => {
        const token = context.get('auth:token');

        const headers = { Authorization: `Bearer ${token}` };
        const response = await fetch(`${this.baseUrl}/persons`, {
            method: 'GET',
            headers,
        });
        const data = await response.json();
        return {
            type: 'ok',
            data: { type: 'collection', value: data },
        };
    };

    findById = async (id: Uuid, context: IContext): Promise<Result<Person>> => {
        const response = await getData(context, id, null, this.baseUrl, 'GET');
        const data = await response.json();
        if (data.length > 0) {
            return {
                type: 'ok',
                data: { type: 'resource', value: data },
            };
        }

        return handleResourceNotFoundError(id);
    };

    create = async (
        entity: Person,
        context: IContext
    ): Promise<Result<Person>> => {
        const token = context.get('auth:token');
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
        const response = await fetch(`${this.baseUrl}/persons`, {
            method: 'POST',
            headers,
            body: JSON.stringify(entity),
        });
        const data = await response.json();
        return {
            type: 'ok',
            data: { type: 'resource', value: data },
        };
    };
}
const getData = async (
    context: IContext,
    id: Uuid,
    entity: Person,
    baseUrl: string,
    method: string
) => {
    const token = context.get('auth:token');
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
    const response = await fetch(`${baseUrl}/persons/${id}`, {
        method: method,
        headers,
        body: entity ? JSON.stringify(entity) : null,
    });
    return response;
};
