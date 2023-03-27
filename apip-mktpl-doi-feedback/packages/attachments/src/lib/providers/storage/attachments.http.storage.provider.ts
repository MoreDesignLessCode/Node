import {
    Uuid,
    Result,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';
import { Attachments } from '../../models/attachment';

import { handleResourceNotFoundError } from '../../utils';

export class AttachmentsHttpStorageProvider implements IStorageProvider<Attachments> {
    baseUrl = process.env.FEEDBACK_DAS_BASE_URL;

    save = async (
        id: Uuid,
        entity: Attachments,
        context: IContext
    ): Promise<Result<Attachments>> => {
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

    delete = async (id: Uuid, context: IContext): Promise<Result<Attachments>> => {
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

    all = async (context: IContext): Promise<Result<Attachments>> => {
        const token = context.get('token');

        const headers = { Authorization: `${token}` };
        const response = await fetch(`${this.baseUrl}/attachments`, {
            method: 'GET',
            headers,
        });
        const data = await response.json();
        return {
            type: 'ok',
            data: { type: 'collection', value: data },
        };
    };

    findById = async (id: Uuid, context: IContext): Promise<Result<Attachments>> => {
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
        entity: Attachments,
        context: IContext
    ): Promise<Result<Attachments>> => {
        const token = context.get('token');
        const headers = {
            Authorization: `${token}`,
            'Content-Type': 'application/json',
        };
        const response = await fetch(`${this.baseUrl}/attachments`, {
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
    entity: Attachments,
    baseUrl: string,
    method: string
) => {
    const token = context.get('token');
    const headers = {
        Authorization: `${token}`,
        'Content-Type': 'application/json',
    };
    const response = await fetch(`${baseUrl}/attachments/${id}`, {
        method: method,
        headers,
        body: entity ? JSON.stringify(entity) : null,
    });
    return response;
};
