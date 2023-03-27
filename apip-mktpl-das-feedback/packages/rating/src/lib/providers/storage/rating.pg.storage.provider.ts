import {
    Uuid,
    Result,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';
import { GeneralAPIError, ResourceNotFoundError } from '../../errors';
import { Ratings, Constants, Message } from '../../models';
import { formatString } from '../../utils';
import * as Pg from 'pg';
import { validate } from 'uuid';
import { IAttachment } from '@cvshealth/apip-mktpl-das-feedback-types';
import { any } from 'joi';

export class RatingPgStorageProvider implements IStorageProvider<Ratings> {
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
    // all(context: IContext): Promise<Result<Ratings>> {
    //     throw new Error('Method not implemented.');
    // }
    // create(entity: Ratings, context: IContext): Promise<Result<Ratings>> {
    //     throw new Error('Method not implemented.');
    // }
    delete(id: Uuid, context: IContext): Promise<Result<Ratings>> {
        throw new Error('Method not implemented.');
    }
    findById(id: Uuid, context: IContext): Promise<Result<Ratings>> {
        throw new Error('Method not implemented.');
    }
    // save(id: Uuid, entity: Ratings, context: IContext): Promise<Result<Ratings>> {
    //     throw new Error('Method not implemented.');
    // }

    // delete(id: Uuid, context: IContext): Promise<Result<Ratings>> {
    //     throw new Error('Method not implemented.');
    // }
    // findById = async (id: Uuid, context: IContext): Promise<Result<Ratings>> => {
    //     let includeMessage = false;
    //     let includeParticipants = false;
    //     let includeAttachemnts = false;
    //     const includesParams: [string] = context.get('includes')
    //     if (includesParams.includes('messages')) {
    //         includeMessage = true
    //     }
    //     if (includesParams.includes('participants')) {
    //         includeParticipants = true
    //     }
    //     try {
    //         const reponse: any = await this.getRatings(includeMessage, includeParticipants, id);
    //         if (reponse.rowCount >= 1) {
    //             return this.handleResult(reponse, 'resource');
    //         } else {
    //             return this.handleResourceNotFound(id);
    //         }
    //     }
    //     catch (err) {
    //         const error = new GeneralAPIError(
    //             Constants.errors.repository.rating.find.CODE,
    //             err
    //         )
    //             .withTitle(Constants.errors.repository.rating.find.TITLE)
    //             .withReason(Constants.errors.repository.rating.find.MESSAGE);
    //         return {
    //             type: 'error',
    //             data: error,
    //         };
    //     }
    // }



    getRatings = async (includeMessage: Boolean, includeParticipants: Boolean, ratingId: Uuid) => {
        let temp = [];
        let query = 
        `SELECT t1.id,t1.idvalue AS ratingId,t1.created_by as createdby,
        (SELECT s.name as status from mktpl.messages m  join
            mktpl.status_types s on m.status =s.id where t1.id=m.artifact_id order by m.created_at desc limit 1),
            (select m.summary from mktpl.messages m where t1.id=m.artifact_id order by m.created_at asc limit 1),
             (select r.rating from mktpl.ratings r   where t1.id=r.artifact_id),
            (select m.description  from mktpl.messages m where t1.id=m.artifact_id order by m.created_at asc limit 1),
        (SELECT json_agg(m.id) FROM mktpl.messages m WHERE m.artifact_id = t1.id) AS "messageIds",
         (SELECT json_agg(p.id) FROM mktpl.participants p WHERE p.artifact_id = t1.id) AS "participantIds",
         (SELECT json_agg(a.id) FROM mktpl.attachments a JOIN mktpl.messages m ON a.message_id = m.id
        WHERE t1.id = m.artifact_id) AS attachmentIds`;
   
        if (includeMessage) {
            query += `,(SELECT json_agg( json_build_object('summary', m.summary, 'status', m.status, 'description', m.description, 'id',m.id))
          FROM mktpl.messages m where t1.id=m.artifact_id) AS messages`;
        }
        if (includeParticipants) {
            query += `,(SELECT json_agg(json_build_object('profile_id', p.profile_id, 'added_by', p.added_by)) 
            FROM mktpl.participants p WHERE p.artifact_id = t1.id ) AS participants`;
        }

        query += ` FROM mktpl.artifacts t1 WHERE t1.type = 'RATING' `
        if (ratingId !== null) {
            temp.push(ratingId)
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

    all = async (context: IContext): Promise<Result<Ratings>> => {
        let includeMessage = false;
        let includeParticipants = false;
        let includeAttachmennts = false;
        const includesParams: [string] = context.get('includes')
        if (includesParams.includes('messages')) {
            includeMessage = true
        }
        if (includesParams.includes('participants')) {
            includeParticipants = true
        }
        try {
            const reponse: any = await this.getRatings(includeMessage, includeParticipants, null);

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
                Constants.errors.repository.rating.all.CODE,
                err
            )
                .withTitle(Constants.errors.repository.rating.all.TITLE)
                .withReason(Constants.errors.repository.rating.all.MESSAGE);
            return {
                type: 'error',
                data: error,
            };
        }
    };

    findStatusValue = async (statusType) => {
        console.log(statusType);
        const response = await this.client.query(
            ' select st.id from mktpl.status_types st where st.name=$1;',
            [
                statusType
            ]

        )
        console.log(response.rows[0].id);
        return response.rows[0].id
    }

    save = async (
        id: Uuid,
        entity: Ratings,
        context: IContext
    ): Promise<Result<Ratings>> => {
        const modifiedBy = Uuid() //get from token
        try {
   
            
            const response = await this.client.query(
                ' select t1.artifact_id from mktpl.ratings t1 where t1.id=$1;',
                [
                    id
                ]

            )

            const profileIds=await this.client.query(
                `select profile_id from mktpl.participants p where p.artifact_id =$1;`,
                [response.rows[0].artifact_id]
            )
           
            let profileIdArray=[] 
             profileIds?.rows?.map(item => {
                profileIdArray.push(item.profile_id)
              })

              
            //}


            const  insertParticipantsvalue=async (item)=>{
                // entity.participants.forEach(async (item,index) => {
                    //let statusId = await this.findStatusValue(item?.status);
                    let participantId=Uuid();
                    const now = new Date().toISOString();
                const insertParticipants =await this.client.query(
                    `INSERT INTO mktpl.participants (id,profile_id,artifact_id,added_by,status,created_at,modified_at,deleted_at,created_by,modified_by,deleted_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);`,
                    [
                        participantId,
                        item.profile_id,
                        response.rows[0].artifact_id,
                        Uuid(),
                        1,
                        // statusIdArray[index],
                        new Date().toISOString(),
                        null,
                        null,
                        Uuid(),
                        null,
                        null
    
    
                    ]
                //)})
                )
                return {
                    type: 'ok',
                    data: { type: 'collection', value: [] },
                };
              }

            const updateParticipantValues=async (item)=>{
                console.log("check....",response.rows[0].artifact_id,item.profile_id);
                const result = await this.client.query(
                    `update mktpl.participants set status =$1 where artifact_id =$2 and profile_id=$3;`,
                    [
                         2,//to be changed
                        response.rows[0].artifact_id,
                        item.profile_id
                    ]
                );
              
                return {
                    type: 'ok',
                    data: { type: 'collection', value: [] },
                };
            }


            entity.participants.map((item)=>{
                if(profileIdArray.length>0 && profileIdArray.includes(item.profile_id)){
                     updateParticipantValues(item)
                }
                else{
                    insertParticipantsvalue(item)
                }
            })
           
          
            return {
                type: 'ok',
                data: { type: 'collection', value: [] },
            };
        // }
        } catch (err) {
            const error = new GeneralAPIError(
                Constants.errors.repository.rating.save.CODE,
                err
            )
                .withTitle(Constants.errors.repository.rating.save.TITLE)
                .withReason(Constants.errors.repository.rating.save.MESSAGE);
            return {
                type: 'error',
                data: error,
            };
        }
    };


    create = async (
        object: Ratings,
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

        try {
            let ratingId = Uuid();
            let idValue=Uuid()
            let artifactId = Uuid();
            let participantId = Uuid();
            let messageId = Uuid();
            let createdBy = Uuid()//Fetch from token

            let attachmentId = Uuid()
            const { ...rest }: any = object

            const insertArtifact = await this.client.query(
                'INSERT INTO mktpl.artifacts (id,idvalue,type,created_at,deleted_at,created_by,modified_by,deleted_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);',
                [
                    artifactId,
                    idValue,
                    "RATING",
                    new Date().toISOString(),
                    null,
                    createdBy,
                    null,
                    null
                ]
            );

            await this.client.query('BEGIN');
            const insertrating = await this.client.query(
                'INSERT INTO mktpl.ratings (id,artifact_id,rating,created_at,deleted_at,created_by,modified_by,deleted_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);',
                [
                    ratingId,
                    artifactId,
                    rest.rating,
                    new Date().toISOString(),
                    null,
                    Uuid(),
                    createdBy,
                    null
                ]
            )
            
            object.participants.forEach(async item => {
                let participantId = Uuid();
                //let status = await this.findStatusValue(item.status);
                await this.client.query(
                    'INSERT INTO mktpl.participants (id,profile_id,artifact_id,added_by,status,created_at,modified_at,deleted_at,created_by,modified_by,deleted_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);',
                    [
                        participantId,
                        Uuid(),
                        artifactId,
                        Uuid(),
                        status,
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
                'INSERT INTO mktpl.messages (id,artifact_id,summary,description,status,created_at,modified_at,deleted_at,created_by,modified_by,deleted_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);',
                [
                    messageId,
                    artifactId,
                    summary,
                    description,
                    status,
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
                    text: 'UPDATE mktpl.attachments SET message_id=$1 WHERE id = ANY($2::uuid[])',
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
                Constants.errors.repository.rating.create.CODE,
                err
            )
                .withTitle(Constants.errors.repository.rating.create.TITLE)
                .withReason(Constants.errors.repository.rating.create.MESSAGE);
            return {
                type: 'error',
                data: error,
            };
        }
    }

    handleResourceNotFound = (id: Uuid): Result<Ratings> => {
        const error = new ResourceNotFoundError(
            Constants.errors.notFound.rating.CODE
        )
            .withTitle(Constants.errors.notFound.rating.TITLE)
            .withReason(
                formatString(Constants.errors.notFound.rating.MESSAGE, id)
            );

        return {
            type: 'error',
            data: error,
        };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buildrating = (element: any): Ratings => {
        const rating: Ratings = new Ratings(
            element.id,
            element.rating,
            element.createdBy,
            element.status,
            element.summary,
            element.description,
            element.messageIds,
            element.participantIds,
            element.messages,
            element.participants,


        );

        return rating;
    };

    handleResult = (res: Pg.QueryResult, type: string): Result<Ratings> => {
     
        const val: Ratings[] = [];
        res.rows.forEach((element) => {
            const rating: Ratings = this.buildrating(element);
            val.push(rating);
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
