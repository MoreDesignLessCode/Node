import {
    Uuid,
    Result,
    IStorageProvider,
    IContext,
} from '@procter-gamble/apip-api-types';
import { GeneralAPIError, ResourceNotFoundError } from '../../errors';
import { Person, Constants, Name } from '../../models';
import { formatString } from '../../utils';
import * as Pg from 'pg';
import { validate } from 'uuid';

export class PersonPgStorageProvider implements IStorageProvider<Person> {
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

    save = async (
        id: Uuid,
        entity: Person,
        context: IContext
    ): Promise<Result<Person>> => {
        try {
            const now = new Date().toISOString();
            const result = await this.client.query(
                'UPDATE mktpl.person SET given_name=$1, middle_name=$2, family_name=$3, modified_at=$4, modified_by=$5 WHERE id=$6;',
                [
                    entity.name.given,
                    entity.name.middle,
                    entity.name.family,
                    now,
                    context.get('auth:claims')['sub'],
                    id,
                ]
            );
            if (result.rowCount === 0) {
                return this.handleResourceNotFound(id);
            }

            const selectResult = await this.client.query(
                `SELECT ${this.columns} FROM mktpl.person WHERE id=$1`,
                [id]
            );

            if (selectResult.rowCount >= 1) {
                return this.handleResult(selectResult, 'resource');
            } else {
                return this.handleResourceNotFound(id);
            }
        } catch (err) {
            const error = new GeneralAPIError(
                Constants.errors.repo.person.save.CODE,
                err
            )
                .withTitle(Constants.errors.repo.person.save.TITLE)
                .withReason(Constants.errors.repo.person.save.MESSAGE);
            return {
                type: 'error',
                data: error,
            };
        }
    };

    delete = async (id: Uuid, context: IContext): Promise<Result<Person>> => {
        try {
            const now = new Date().toISOString();
            const result1 = await this.client.query(
                'UPDATE mktpl.person SET deleted_at=$1, deleted_by=$2 WHERE id=$3 AND deleted_at IS NULL;',
                [now, context.get('auth:claims')['sub'], id]
            );
            if (result1.rowCount >= 1) {
                try {
                    const result = await this.client.query(
                        `SELECT ${this.columns} FROM mktpl.person WHERE id=$1`,
                        [id]
                    );

                    if (result.rowCount >= 1) {
                        return this.handleResult(result, 'resource');
                    } else {
                        return this.handleResourceNotFound(id);
                    }
                } catch (err) {
                    const error = new GeneralAPIError(
                        Constants.errors.repo.person.innerDelete.CODE,
                        err
                    )
                        .withTitle(
                            Constants.errors.repo.person.innerDelete.TITLE
                        )
                        .withReason(
                            Constants.errors.repo.person.innerDelete.MESSAGE
                        );
                    return {
                        type: 'error',
                        data: error,
                    };
                }
            } else {
                return this.handleResourceNotFound(id);
            }
        } catch (err) {
            const error = new GeneralAPIError(
                Constants.errors.repo.person.delete.CODE,
                err
            )
                .withTitle(Constants.errors.repo.person.delete.TITLE)
                .withReason(Constants.errors.repo.person.delete.MESSAGE);
            return {
                type: 'error',
                data: error,
            };
        }
    };

    all = async (_context: IContext): Promise<Result<Person>> => {
        try {
            const res = await this.client.query(
                `SELECT ${this.columns} FROM mktpl.person WHERE deleted_at IS NULL;`
            );

            if (res.rowCount >= 1) {
                return this.handleResult(res, 'collection');
            } else {
                return {
                    type: 'ok',
                    data: { type: 'collection', value: [] },
                };
            }
        } catch (err) {
            const error = new GeneralAPIError(
                Constants.errors.repo.person.all.CODE,
                err
            )
                .withTitle(Constants.errors.repo.person.all.TITLE)
                .withReason(Constants.errors.repo.person.all.MESSAGE);
            return {
                type: 'error',
                data: error,
            };
        }
    };

    findById = async (
        id: Uuid,
        _context: IContext
    ): Promise<Result<Person>> => {
        try {
            const res = await this.client.query(
                `SELECT ${this.columns} FROM mktpl.person WHERE id=$1 AND deleted_at IS NULL`,
                [id]
            );

            if (res.rowCount >= 1) {
                return this.handleResult(res, 'resource');
            } else {
                return this.handleResourceNotFound(id);
            }
        } catch (err) {
            const error = new GeneralAPIError(
                Constants.errors.repo.person.find.CODE,
                err
            )
                .withTitle(Constants.errors.repo.person.find.TITLE)
                .withReason(Constants.errors.repo.person.find.MESSAGE);
            return {
                type: 'error',
                data: error,
            };
        }
    };

    create = async (
        object: Person,
        context: IContext
    ): Promise<Result<Person>> => {
        try {
            const now = new Date().toISOString();
            let newPersonId = object.id;
            if (!newPersonId || !validate(newPersonId)) {
                newPersonId = Uuid();
                object.id = newPersonId;
            }

            await this.client.query(
                'INSERT INTO mktpl.person (id,given_name,middle_name,family_name,created_at,modified_at,deleted_at,created_by,modified_by,deleted_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);',
                [
                    newPersonId,
                    object.name.given,
                    object.name.middle,
                    object.name.family,
                    now,
                    null,
                    null,
                    context.get('auth:claims')['sub'],
                    null,
                    null,
                ]
            );

            return {
                type: 'ok',
                data: { type: 'resource', value: object },
            };
        } catch (err) {
            const error = new GeneralAPIError(
                Constants.errors.repo.person.create.CODE,
                err
            )
                .withTitle(Constants.errors.repo.person.create.TITLE)
                .withReason(Constants.errors.repo.person.create.MESSAGE);
            return {
                type: 'error',
                data: error,
            };
        }
    };

    handleResourceNotFound = (id: Uuid): Result<Person> => {
        const error = new ResourceNotFoundError(
            Constants.errors.notFound.person.CODE
        )
            .withTitle(Constants.errors.notFound.person.TITLE)
            .withReason(
                formatString(Constants.errors.notFound.person.MESSAGE, id)
            );

        return {
            type: 'error',
            data: error,
        };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buildPerson = (element: any): Person => {
        const person: Person = new Person(
            element.id,
            new Name(
                element.given_name,
                element.family_name,
                element.middle_name
            )
        );

        return person;
    };

    handleResult = (res: Pg.QueryResult, type: string): Result<Person> => {
        const val: Person[] = [];
        res.rows.forEach((element) => {
            const person: Person = this.buildPerson(element);
            val.push(person);
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
