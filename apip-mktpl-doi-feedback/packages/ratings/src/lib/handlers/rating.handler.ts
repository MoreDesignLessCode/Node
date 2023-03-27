import {
    IHandler,
    IService,
    IResource,
    Result,
    IRequest,
    PathParams,
    ResponseBuilder,
    QueryParameters
} from '@cvshealth/apip-api-types';
import { match } from 'ts-pattern';
import { validate as uuidValidate } from 'uuid';
import { FastifyReply } from 'fastify';
import { Ratings, RatingSchema } from '../models/ratings';
import {
    ValidationAPIError,
    ResourceNotFoundError,
    GeneralAPIError,
} from '../errors';
import { Constants } from '../models';
// needed to wire apip.ctx to req
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { fastifyRequestContextMiddleware } from '@cvshealth/apip-context-middleware';




export class RatingHandler implements IHandler {

    ratingService: IService<Ratings>
    responseBuilder: ResponseBuilder;
    constructor(ratingService: IService<Ratings>) {
        this. ratingService =  ratingService;
        this.responseBuilder = new ResponseBuilder();
    }

    get = async (req: IRequest<Ratings>, reply: FastifyReply) => {

        try {
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            const queryParams: any = req.query
            const includesParams = queryParams?.includes?.split(',') || []
            req.apip.ctx.set<QueryParameters>('includes', includesParams)
            if (params.id === undefined) {
                return this.getCollection(req, reply);
            }

            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.rating.get.CODE
                );
            }

            const result = await this.ratingService.getById(params.id, req.apip.ctx);
            match(result)
                .with({ type: 'ok' }, (res) => {
                    const result: IResource[] = [];
                    result.push(res.data.value);
                    reply.type('application/json').code(200).send(result);
                })
                .with({ type: 'error' }, (res) => {
                    const error = res.data;
                    if (error instanceof ResourceNotFoundError) {
                        const result: IResource[] = [];
                        reply.type('application/json').code(200).send(result);
                    } else {
                        reply
                            .type('application/json')
                            .code(400)
                            .send(error.toJson());
                    }
                })
                .exhaustive();
        } catch (error) {
            req.log.error(error);
            reply
                .type('application/json')
                .code(400)
                .send(
                    this.generateGenericError(
                        error as Error,
                        Constants.errors.handler.rating.get.CODE,
                        Constants.errors.handler.rating.get.MESSAGE,
                        Constants.errors.handler.rating.get.TITLE
                    )
                );
        }
    };

    getCollection = async (req: IRequest<Ratings>, reply: FastifyReply) => {
        const result = await this.ratingService.getCollection(req.apip.ctx);
        const queryParams: any = req.query
        const messages = [];
        const participants = [];
        const attachmentsArry = [];
        const includesParams = queryParams?.includes?.split(',') || []
        let ticketdata = []
        let messagesArr = [];
        let participantsArr = [];
        let attachmentsArr = [];
        match(result)
            .with({ type: 'ok' }, (result) => {
                const response: any = result.data.value
                response?.map(({ messages, participants, attachments, ...rest }) => {
                    ticketdata.push(rest);
                    if (messages) {
                        messagesArr.push(...messages)
                    }
                    if (participants) {
                        participantsArr.push(...participants);
                    }
                    if (attachments) {
                        attachmentsArr.push(...attachments)
                    }
                });
                this.responseBuilder.setData(ticketdata);
                this.responseBuilder.addIncludes('messages', messagesArr)
                this.responseBuilder.addIncludes('participants', participantsArr)
                this.responseBuilder.addIncludes('attachments', attachmentsArr)
                reply
                    .type('application/json')
                    .code(200)
                    .send(this.responseBuilder.build());
            })
            .with({ type: 'error' }, (result) => {
                reply
                    .type('application/json')
                    .code(400)
                    .send(result.data.toJson());
            })
            .exhaustive();
    }


    post = async (req: IRequest<Ratings>, reply: FastifyReply) => {
        const { body: rating } = req;
        const { value: validRating, error } = RatingSchema.validate(rating, {
            stripUnknown: true,
        })
        if (error) {
            const validationError = new ValidationAPIError(
                Constants.errors.validation.rating.create.CODE,
                error
            )
                .withReason(Constants.errors.validation.rating.create.MESSAGE)
                .withTitle(Constants.errors.validation.rating.create.TITLE);
            reply
                .type('application/json')
                .code(400)
                .send(validationError.toJson());
        }
        else {
            const result = await this.ratingService.create(validRating, req.apip.ctx);
            this.matchOkOrError(result, reply, 201);
        }

    };


    put = async (req: IRequest<Ratings>, reply: FastifyReply) => {
        try {
            const { body: rating } = req;
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.rating.get.CODE
                );
            }

            const { value: validPerson, error } = RatingSchema.validate(rating);

            if (error) {
                const validationError = new ValidationAPIError(
                    Constants.errors.validation.rating.update.CODE,
                    error
                )
                    .withReason(
                        Constants.errors.validation.rating.update.MESSAGE
                    )
                    .withTitle(Constants.errors.validation.rating.update.TITLE);
                reply
                    .type('application/json')
                    .code(400)
                    .send(validationError.toJson());
            } else {
                const result = await this.ratingService.update(
                    params.id,
                    validPerson,
                    req.apip.ctx
                );
                this.matchOkOrError(result, reply, 200);
            }
        } catch (error) {
            req.log.error(error);
            reply
                .type('application/json')
                .code(400)
                .send(
                    this.generateGenericError(
                        error as Error,
                        Constants.errors.handler.rating.update.CODE,
                        Constants.errors.handler.rating.update.MESSAGE,
                        Constants.errors.handler.rating.update.TITLE
                    )
                );
        }
    };



    delete = async (req: IRequest<Ratings>, reply: FastifyReply) => {
        try {
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.rating.get.CODE
                );
            }
            const result = await this.ratingService.delete(params.id, req.apip.ctx);
            match(result)
                .with({ type: 'ok' }, () =>
                    reply.type('application/json').code(204).send()
                )
                .with({ type: 'error' }, (result) => {
                    const error = result.data;
                    reply
                        .type('application/json')
                        .code(400)
                        .send(error.toJson());
                })
                .exhaustive();
        } catch (error) {
            req.log.error(error);
            reply
                .type('application/json')
                .code(400)
                .send(
                    this.generateGenericError(
                        error as Error,
                        Constants.errors.handler.rating.get.CODE,
                        Constants.errors.handler.rating.get.MESSAGE,
                        Constants.errors.handler.rating.get.TITLE
                    )
                );
        }
    };


    handleError = (
        req: IRequest<Ratings>,
        error: unknown,
        reply: FastifyReply,
        code: string,
        message: string,
        title: string
    ) => {
        req.log.error(error);
        reply
            .type('application/json')
            .code(400)
            .send(
                this.generateGenericError(error as Error, code, message, title)
            );
    };

    generateGenericError = (
        error: Error,
        code: string,
        reason: string,
        title: string
    ): unknown => {
        return new GeneralAPIError(code, error)
            .withReason(reason)
            .withTitle(title)
            .toJson();
    };


    matchOkOrError = (
        result: Result<Ratings>,
        reply: FastifyReply,
        statusCode: number
    ) => {
        match(result)
            .with({ type: 'ok' }, (result) =>
                reply
                    .type('application/json')
                    .code(statusCode)
                    .send(result.data.value)
            )
            .with({ type: 'error' }, (result) => {
                reply
                    .type('application/json')
                    .code(400)
                    .send(result.data.toJson());
            })
            .exhaustive();
    };
}
