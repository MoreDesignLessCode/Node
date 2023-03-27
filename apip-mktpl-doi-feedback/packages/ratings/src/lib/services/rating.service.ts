import {
    Uuid,
    IRepository,
    Result,
    IService,
    IContext,
} from '@cvshealth/apip-api-types';
import { Ratings } from '../models';




export class RatingService implements IService<Ratings> {
    ratingRepository: IRepository<Ratings>;
    messageRepository: IRepository<any>;
    attachmentRepository: IRepository<any>;


    constructor(ratingRepository: IRepository<Ratings>, messageRepository: IRepository<any>, attachmentRepository: IRepository<any>) {
        this.ratingRepository = ratingRepository;
        this.messageRepository = messageRepository;
        this.attachmentRepository = attachmentRepository;

    }
    // create(entity: Ratings, context: IContext): Promise<Result<Ratings>> {
    //     throw new Error('Method not implemented.');
    // }

    create = async (entity: Ratings,context: IContext): Promise<Result<Ratings>> => {
        return  this.ratingRepository.create(entity, context);
    }


    // The service should only hold business logic, and not worry about shapes of the returns
    getById = (id: Uuid,context:IContext): Promise<Result<Ratings>> => this.ratingRepository.find(id,context);

    getCollection = (context: IContext): Promise<Result<Ratings>> =>this.ratingRepository.all(context)

    update = (id: Uuid, entity: Ratings, context:IContext): Promise<Result<Ratings>> => this.ratingRepository.update(id, entity, context);


    delete = (id: Uuid, context: IContext): Promise<Result<Ratings>> => this.ratingRepository.delete(id, context);
}