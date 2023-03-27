import {
    Uuid,
    Result,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';
import { Tickets } from '../../models';

import { handleResourceNotFoundError } from '../../utils';

export class TicketsHttpStorageProvider implements IStorageProvider<Tickets> {
    baseUrl = process.env.FEEDBACK_DAS_BASE_URL;

    save = async (
        id: Uuid,
        entity: Tickets,
        context: IContext
    ): Promise<Result<Tickets>> => {
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

    delete = async (id: Uuid, context: IContext): Promise<Result<Tickets>> => {
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

    all = async (context: IContext): Promise<Result<Tickets>> => {
      
        const token = context.get('token');
        const fields=context.get('includes')
        const headers = { Authorization: `${token}` };
        const response = await fetch(`${this.baseUrl}/tickets?includes=${fields}`, {
            method: 'GET',
            headers
        });
        const data = await response.json();
        return {
            type: 'ok',
            data: { type: 'collection', value: data },
        };
    };

    findById = async (id: Uuid, context: IContext): Promise<Result<Tickets>> => {
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
        entity: Tickets,
        context: IContext
    ): Promise<Result<Tickets>> => {
        const token = context.get('token');
        const headers = {
            Authorization: `${token}`,
            'Content-Type': 'application/json',
        };
        const response = await fetch(`${this.baseUrl}/tickets`, {
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
    entity: Tickets,
    baseUrl: string,
    method: string
) => {
    const token = context.get('token');
    const fields=context.get('includes')
    const headers = {
        Authorization: `${token}`,
        'Content-Type': 'application/json',
    };
    const response = await fetch(`${baseUrl}/tickets/${id}?includes=${fields}`, {
        method: method,
        headers,
        body: entity ? JSON.stringify(entity) : null,
    });
    return response;
};
