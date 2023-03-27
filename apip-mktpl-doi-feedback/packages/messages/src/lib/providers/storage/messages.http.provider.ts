import {
    Uuid,
    Result,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';
import { Messages } from '../../models';

import { handleResourceNotFoundError } from '../../utils';

export class MessagessHttpStorageProvider implements IStorageProvider<Messages> {
    baseUrl = process.env.FEEDBACK_DAS_BASE_URL;

    save = async (
        id: Uuid,
        entity: Messages,
        context: IContext
    ): Promise<Result<Messages>> => {
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

    delete = async (id: Uuid, context: IContext): Promise<Result<Messages>> => {
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

    all = async (context: IContext): Promise<Result<Messages>> => {
        const token = context.get('token');
        const artifactType=context.get('artifactType')
        const ids=context.get('id')
        let url: string;
        if(artifactType){
            url=`${this.baseUrl}/messages?artifactType=${artifactType}`
        }
        else{
            url=`${this.baseUrl}/messages?id=${ids}`
        }
        const headers = { Authorization: `${token}` };
        const response = await fetch(url, {
            method: 'GET',
            headers,
        });
        const data = await response.json();
        return {
            type: 'ok',
            data: { type: 'collection', value: data },
        };
    };

    findById = async (id: Uuid, context: IContext): Promise<Result<Messages>> => {
        const response = await getData(context, id, null, this.baseUrl, 'GET');
        const token = context.get('token');

        const headers = { Authorization: `${token}` };
        // const response = await fetch(`${this.baseUrl}/messages`, {
        //     method: 'GET',
        //     headers,
        // });
        const data = await response.json();
        if (data.length > 0) {
            return {
                type: 'ok',
                data: { type: 'resource', value: data[0] },
            };
        }

        return handleResourceNotFoundError(id);
    };

    create = async (
        entity: Messages,
        context: IContext
    ): Promise<Result<Messages>> => {
        const token = context.get('token');
        const headers = {
            Authorization: `${token}`,
            'Content-Type': 'application/json',
        };
        const response = await fetch(`${this.baseUrl}/messages`, {
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
    entity: Messages,
    baseUrl: string,
    method: string
) => {
    const token = context.get('token');
    const headers = {
        Authorization: `${token}`,
        'Content-Type': 'application/json',
    };
    const response = await fetch(`${baseUrl}/messages/${id}`, {
        method: method,
        headers,
        body: entity ? JSON.stringify(entity) : null,
    });
    return response;
};
