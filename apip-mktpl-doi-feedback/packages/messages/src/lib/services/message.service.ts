import {
    Uuid,
    IRepository,
    Result,
    IService,
    IContext,
} from '@cvshealth/apip-api-types';
import { Messages } from '../models';


export class MessagessService implements IService<Messages> {
    messageRepository: IRepository<any>;
    attachmentRepository: IRepository<any>;


    constructor( messageRepository: IRepository<any>, attachmentRepository: IRepository<any>) {
        this.messageRepository = messageRepository;
        this.attachmentRepository = attachmentRepository;

    }
   
    // The service should only hold business logic, and not worry about shapes of the returns
    getById = (id: Uuid,context:IContext): Promise<Result<Messages>> => this.messageRepository.find(id,context);

    getCollection = (context: IContext): Promise<Result<Messages>> =>{
        return this.messageRepository.all(context);
    }

    create = async (entity: Messages,context: IContext): Promise<Result<Messages>> => {
         return this.messageRepository.create(entity, context)
    }

    update = (id: Uuid, entity: Messages, context:IContext): Promise<Result<Messages>> => this.messageRepository.update(id, entity, context);


    delete = (id: Uuid, context: IContext): Promise<Result<Messages>> => this.messageRepository.delete(id, context);
}