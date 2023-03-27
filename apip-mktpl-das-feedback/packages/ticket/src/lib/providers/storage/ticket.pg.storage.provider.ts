import {
    Uuid,
    Result,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';
import { GeneralAPIError, ResourceNotFoundError } from '../../errors';
import { Tickets, Constants, Message } from '../../models';
import { formatString } from '../../utils';
import * as Pg from 'pg';
import { validate } from 'uuid';
import { IAttachment } from '@cvshealth/apip-mktpl-das-feedback-types';

export class TicketPgStorageProvider implements IStorageProvider<Tickets> {
    client: Pg.Client;
    columns =
        'id, given_name, middle_name, family_name, created_at, modified_at, deleted_at, created_by, modified_by, deleted_by';

    constructor() {
        const connString = `postgresql://${process.env.PERSON_DAS_DB_USER}:${process.env.PERSON_DAS_DB_PASSWORD}@${process.env.PERSON_DAS_DB_HOST}:${process.env.PERSON_DAS_DB_PORT}/${process.env.PERSON_DAS_DB_NAME}`;

        this.client = new Pg.Client({
            connectionString: connString,
        });
        this.client.connect();
    }

    delete(id: Uuid, context: IContext): Promise<Result<Tickets>> {
        throw new Error('Method not implemented.');
    }
    findById = async (id: Uuid, context: IContext): Promise<Result<Tickets>> => {
        let includeMessage = false;
        let includeParticipants = false;
        let includeAttachments = false;
        const includesParams: [string] = context.get('includes')
        if (includesParams.includes('messages')) {
            includeMessage = true
        }
        if (includesParams.includes('participants')) {
            includeParticipants = true
        }
        if(includesParams.includes('attachments')){
            includeAttachments = true;
        }
        try {
            const reponse: any = await this.getTickets(includeMessage, includeParticipants,includeAttachments,id);
            if (reponse.rowCount >= 1) {
                return this.handleResult(reponse, 'resource');
            } else {
                return this.handleResourceNotFound(id);
            }
        }
        catch (err) {
            const error = new GeneralAPIError(
                Constants.errors.repository.ticket.find.CODE,
                err
            )
                .withTitle(Constants.errors.repository.ticket.find.TITLE)
                .withReason(Constants.errors.repository.ticket.find.MESSAGE);
            return {
                type: 'error',
                data: error,
            };
        }
    }



    getTickets = async (includeMessage: Boolean, includeParticipants: Boolean, includesAttachments:Boolean, ticketId: Uuid) => {
        let temp = [];
        let query = `SELECT t1.id,t1.idvalue AS ticketId,t1.created_by as createdby,
        (SELECT s.name as status from mktplnew.messages m  join
            mktplnew.status_types s on m.status =s.id where t1.id=m.artifact_id order by m.created_at desc limit 1),
            (select m.summary from mktplnew.messages m where t1.id=m.artifact_id order by m.created_at asc limit 1),
            (select m.description  from mktplnew.messages m where t1.id=m.artifact_id order by m.created_at asc limit 1),
        (SELECT json_agg(m.id) FROM mktplnew.messages m WHERE m.artifact_id = t1.id) AS "messageIds",
         (SELECT json_agg(p.id) FROM mktplnew.participants p WHERE p.artifact_id = t1.id) AS "participantIds",
         (SELECT json_agg(a.id) FROM mktplnew.attachments a JOIN mktplnew.messages m ON a.message_id = m.id
        WHERE t1.id = m.artifact_id) AS attachmentIds`;

        if (includeMessage) {
            query += `,(SELECT json_agg(json_build_object('id', m.id,'description', m.description,'summary', m.summary,
            'status', st.name,'attachmentIds', att.attachments)ORDER BY m.created_at) 
            FROM (select messages.id, messages.summary, messages.status, messages.description, messages.created_at
            FROM mktplnew.messages  WHERE messages.artifact_id = t1.id) m
            LEFT JOIN (SELECT message_id, json_agg(attachments.id) AS attachments FROM mktplnew.attachments 
            GROUP BY message_id) att ON att.message_id = m.id
            LEFT JOIN mktplnew.status_types st ON st.id = m.status) AS messages
            `;
        }
        if (includeParticipants) {
            query += `,(SELECT json_agg(json_build_object('profile_id', p.profile_id, 'added_by', p.added_by)) 
            FROM mktplnew.participants p WHERE p.artifact_id = t1.id ) AS participants`;
        }
        if(includesAttachments){
            query+=`,(SELECT json_agg(  json_build_object(
                'name', a.name,
                'url', a.url
            )) FROM mktplnew.attachments a JOIN mktplnew.messages m ON a.message_id = m.id
WHERE t1.id = m.artifact_id) AS attachments`
        }

        query += ` FROM mktplnew.artifacts t1 WHERE t1.type = 'TICKET' `
        if (ticketId !== null) {
            temp.push(ticketId)
            query += `and t1.idValue=$1 `
        }
        query += `GROUP BY t1.id, t1.idvalue`;
        try {
            const res = await this.client.query(query, temp);
            return res
        }
        catch (err) {
            return err
        }
    };

    all = async (context: IContext): Promise<Result<Tickets>> => {
        let includeMessage = false;
        let includeParticipants = false;
        let includeAttachments = false;
        const includesParams: [string] = context.get('includes')
        if (includesParams.includes('messages')) {
            includeMessage = true
        }
        if (includesParams.includes('participants')) {
            includeParticipants = true
        }
        if(includesParams.includes('attachments')){
            includeAttachments = true;
        }
        try {
            const reponse: any = await this.getTickets(includeMessage, includeParticipants,includeAttachments,null);

            if (reponse.rowCount >= 1) {
                return this.handleResult(reponse, 'collection');
            } else {
                return {
                    type: 'ok',
                    data: { type: 'collection', value: [] },
                };
            }
        }
        catch (err) {
            const error = new GeneralAPIError(
                Constants.errors.repository.ticket.all.CODE,
                err
            )
                .withTitle(Constants.errors.repository.ticket.all.TITLE)
                .withReason(Constants.errors.repository.ticket.all.MESSAGE);
            return {
                type: 'error',
                data: error,
            };
        }
    };

    findStatusValue = async (statusType) => {
        const response = await this.client.query(
            ' select st.id from mktplnew.status_types st where st.name=$1;',
            [
                statusType
            ]

        )

        return response.rows[0]
    }

    save = async (
        id: Uuid,
        entity: Tickets,
        context: IContext
    ): Promise<Result<Tickets>> => {
        const modifiedBy = Uuid() //get from token
        try {
            const response = await this.client.query(
                ' select t1.id from mktplnew.artifacts t1 where t1.idValue=$1;',
                [
                    id
                ]

            )
            console.log("here0", response.rows[0].id)

            const now = new Date().toISOString();
            let participantStatus = await this.findStatusValue(entity.participants[0].status)
            console.log("participant Status", participantStatus)
            const result = await this.client.query(
                `update mktplnew.participants  set status =$1 where artifact_id =$2 and profile_id=$3`,
                [
                    participantStatus.id,
                    response.rows[0].id,
                    entity.participants[0].profile_id
                ]
            );
            return {
                type: 'ok',
                data: { type: 'collection', value: result.rows },
            };

        } catch (err) {
            const error = new GeneralAPIError(
                Constants.errors.repository.ticket.save.CODE,
                err
            )
                .withTitle(Constants.errors.repository.ticket.save.TITLE)
                .withReason(Constants.errors.repository.ticket.save.MESSAGE);
            return {
                type: 'error',
                data: error,
            };
        }
    };


    create = async (
        object: Tickets,
        context: IContext
    ): Promise<Result<any>> => {
        // try {
        const now = new Date().toISOString();
        // const attachmentIds: IAttachment[] = object?.messages?.attachments
        const attachmentIds: IAttachment[] = [];
        let status:any
        let  summary:string|undefined
        let description:string |undefined
        if (object?.messages) {
            if (Array.isArray(object.messages)) {
                // If messages is an array of messages, concatenate the attachments from each message
                object.messages.forEach(async(message) => {
                    attachmentIds.push(...(message.attachments || []));
                    status=await this.findStatusValue(message.status)
                    summary=message?.summary;
                    description=message?.description 
                });
            } else {
                // If messages is a single message, use its attachments
                attachmentIds.push(...(object.messages.attachments || []));
                status=await this.findStatusValue(object.messages.status)
                summary=object.messages.summary;
                description=object.messages.description 
            }
        }
        console.log("attachmentIds",attachmentIds)

        try {
            let ticketId = Uuid();
            let artifactId = Uuid();
            let participantId = Uuid();
            let messageId = Uuid();
            let createdBy = Uuid()//Fetch from token

            let attachmentId = Uuid()
            const { ...rest }: any = object

            await this.client.query('BEGIN');
            const insertTicket = await this.client.query(
                'INSERT INTO mktplnew.ticket (id,created_at,deleted_at,created_by,modified_by,deleted_by) VALUES ($1,$2,$3,$4,$5,$6);',
                [
                    ticketId,
                    new Date().toISOString(),
                    null,
                    Uuid(),
                    createdBy,
                    null
                ]
            )
            const insertArtifact = await this.client.query(
                'INSERT INTO mktplnew.artifacts (id,idvalue,type,created_at,deleted_at,created_by,modified_by,deleted_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);',
                [
                    artifactId,
                    ticketId,
                    "TICKET",
                    new Date().toISOString(),
                    null,
                    createdBy,
                    null,
                    null
                ]
            );
            object.participants.forEach(async item => {
                let participantId = Uuid();
                let status = await this.findStatusValue(item.status);
                await this.client.query(
                    'INSERT INTO mktplnew.participants (id,profile_id,artifact_id,added_by,status,created_at,modified_at,deleted_at,created_by,modified_by,deleted_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);',
                    [
                        participantId,
                        Uuid(),
                        artifactId,
                        Uuid(),
                        status.id,
                        new Date().toISOString(),
                        null,
                        null,
                        createdBy,
                        null,
                        null
                    ]
                );
            })

           
            const insertMessages = await this.client.query(
                'INSERT INTO mktplnew.messages (id,artifact_id,summary,description,status,created_at,modified_at,deleted_at,created_by,modified_by,deleted_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);',
                [
                    messageId,
                    artifactId,
                    summary,
                    description,
                    status?.id,
                    new Date().toISOString(),
                    null,
                    null,
                    createdBy,
                    null,
                    null
                ]
            );
            if (attachmentIds) {
                const query = {
                    text: 'UPDATE mktplnew.attachments SET message_id=$1 WHERE id = ANY($2::uuid[])',
                    values: [messageId, attachmentIds],
                };
                await this.client.query(query)
            }
            await this.client.query('COMMIT');

            return {
                type: 'ok',
                data: { type: 'resource', value: object },
            };
        } catch (err) {
            const error = new GeneralAPIError(
                Constants.errors.repository.ticket.create.CODE,
                err
            )
                .withTitle(Constants.errors.repository.ticket.create.TITLE)
                .withReason(Constants.errors.repository.ticket.create.MESSAGE);
            return {
                type: 'error',
                data: error,
            };
        }
    }

    handleResourceNotFound = (id: Uuid): Result<Tickets> => {
        const error = new ResourceNotFoundError(
            Constants.errors.notFound.ticket.CODE
        )
            .withTitle(Constants.errors.notFound.ticket.TITLE)
            .withReason(
                formatString(Constants.errors.notFound.ticket.MESSAGE, id)
            );

        return {
            type: 'error',
            data: error,
        };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buildTicket = (element: any): Tickets => {
        console.log(element)
        const ticket: Tickets = new Tickets(
            element.ticketId,
            element.createdBy,
            element.status,
            element.summary,
            element.description,
            element.messageIds,
            element.participantIds,
            element.attachmentids,
            element.messages,
            element.participants,
            element.attachments


        );

        return ticket;
    };

    handleResult = (res: Pg.QueryResult, type: string): Result<Tickets> => {
        const val: Tickets[] = [];
        res.rows.forEach((element) => {
            const ticket: Tickets = this.buildTicket(element);
            val.push(ticket);
        });

        if (type === 'resource') {
            return {
                type: 'ok',
                data: { type: 'resource', value: val[0] },
            };
        } else {
            return {
                type: 'ok',
                data: { type: 'collection', value: val },
            };
        }
    };
}
