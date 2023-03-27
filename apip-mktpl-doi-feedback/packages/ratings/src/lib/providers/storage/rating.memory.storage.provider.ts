import {
    Constants,
    formatString,
  
    ResourceNotFoundError,

    Ratings,
} from '../../index';
import {
    parseUuid,
    Uuid,
    Result,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';


export class ratingMemoryStorageProvider implements IStorageProvider<Ratings> {


    ratingSample: Ratings[] = [{
        id: parseUuid('11e62cea-eedd-40e5-8b68-26efe3c47d37'),
        status: "NEW",
        createdBy: parseUuid('11e62cea-eedd-40e5-8b68-26efe3c47d37'),
        messages: [{
            id: parseUuid('11e62cea-eedd-40e5-8b68-26efe3c47d37'),
            summary: "hello",
            status: "new",
            createdBy: parseUuid('11e62cea-eedd-40e5-8b68-26efe3c47d37'),
            description: "hey",
        }],
        participants: [{
            id: parseUuid('11e62cea-eedd-40e5-8b68-26efe3c47d37'),
            status: "Responsible",
        }]
    }, {
        id: parseUuid('2c4c587d-6155-45d1-b6d8-35f7b5501169'),
        status: "NEW",
        createdBy: parseUuid('2c4c587d-6155-45d1-b6d8-35f7b5501169'),
        messages: [{
            id: parseUuid('2c4c587d-6155-45d1-b6d8-35f7b5501169'),
            summary: "hello",
            status: "new",
            createdBy: parseUuid('2c4c587d-6155-45d1-b6d8-35f7b5501169'),
            description: "hey",
        }],
        participants: [{
            id: parseUuid('2c4c587d-6155-45d1-b6d8-35f7b5501169'),
            status: "Responsible",
        }]
    }]

    save = (id: Uuid, entity: Ratings,context:IContext): Promise<Result<Ratings>>   => {
        return new Promise((resolve) => {
            const result = this.ratingSample.find((rating: Ratings) => {
                return rating.id === id;
            });

            if (result != undefined) {
                const index = this.ratingSample.indexOf(result, 0);
                this.ratingSample[index] = {...this.ratingSample[index],...entity};
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: this.ratingSample[index] },
                });
            } else {
                const error = new ResourceNotFoundError(
                    Constants.errors.notFound.rating.CODE
                )
                    .withTitle(Constants.errors.notFound.rating.TITLE)
                    .withReason(
                        formatString(
                            Constants.errors.notFound.rating.MESSAGE,
                            id
                        )
                    );

                resolve({ type: 'error', data: error });
            }
        });
    };

    delete = (id: Uuid): Promise<Result<Ratings>> => {
        return new Promise((resolve) => {
            const result = this.ratingSample.find((rating: Ratings) => {
                return rating.id === id;
            });
            if (result != undefined) {
                const index = this.ratingSample.indexOf(result, 0);
                this.ratingSample.splice(index, 1);
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: result },
                });
            } else {
                const error = new ResourceNotFoundError(
                    Constants.errors.notFound.rating.CODE
                )
                    .withTitle(Constants.errors.notFound.rating.TITLE)
                    .withReason(
                        formatString(
                            Constants.errors.notFound.rating.MESSAGE,
                            id
                        )
                    );
                resolve({ type: 'error', data: error });
            }
        });
    }

    all = (): Promise<Result<Ratings>> => {
        return new Promise((resolve) => {
            resolve({
                type: 'ok',
                data: { type: 'collection', value: this.ratingSample },
            });
        });
    };

    findById =(id: Uuid, context: IContext): Promise<Result<Ratings>> => {
        return new Promise((resolve) => {
            const result = this.ratingSample.find((rating: Ratings) => {
                return rating.id === id;
            });

            if (result) {
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: result },
                });
            }

            const error = new ResourceNotFoundError(
                Constants.errors.notFound.rating.CODE
            )
                .withTitle(Constants.errors.notFound.rating.TITLE)
                .withReason(
                    formatString(Constants.errors.notFound.rating.MESSAGE, id)
                );
            resolve({
                type: 'error',
                data: error,
            });
        });
   
    };

    create = (object: Ratings ,context:IContext):Promise<Result<Ratings>>=> {
       const {messages,participants,...rest}=object
        messages.map(messages=>{
            messages.id=Uuid()
        })
        participants.map(participant=>{
            participant.id=Uuid()
        })

        let newResp={
            ...rest,
            id:Uuid()
        }
        const newObj={
           ...newResp,
            messages,
            participants
        }
        this.ratingSample.push(newObj);
        return new Promise((resolve) => {
            resolve({
                type: 'ok',
                data: { type: 'resource', value: object },
            });
        });
    };

}
