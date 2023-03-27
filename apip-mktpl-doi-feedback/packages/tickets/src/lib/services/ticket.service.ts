import {
    Uuid,
    IRepository,
    Result,
    IService,
    IContext,
} from '@cvshealth/apip-api-types';
import { Tickets } from '../models';




export class TicketsService implements IService<Tickets> {
    ticketRepository: IRepository<Tickets>;
    messageRepository: IRepository<any>;
    attachmentRepository: IRepository<any>;


    constructor(ticketRepository: IRepository<Tickets>, messageRepository: IRepository<any>, attachmentRepository: IRepository<any>) {
        this.ticketRepository = ticketRepository;
        this.messageRepository = messageRepository;
        this.attachmentRepository = attachmentRepository;

    }



    // The service should only hold business logic, and not worry about shapes of the returns
    getById = (id: Uuid,context:IContext): Promise<Result<Tickets>> => this.ticketRepository.find(id,context);

    getCollection = async(context: IContext): Promise<Result<Tickets>> =>{
        let ticketdata=[]
        let messagesArr=[];
        let participantsArr=[];
        const response:any= await  this.ticketRepository.all(context);
        response?.data?.value.map(({ messages,participants, ...rest }) => {
            ticketdata.push(rest);
            messagesArr.push(messages)
            participantsArr.push(participants);
        });
      
        
        // return { type: 'ok', data: { type: 'resource', value: { data:ticketdata ,} } };
        return this.ticketRepository.all(context)}

    create = async (entity: Tickets,context: IContext): Promise<Result<Tickets>> => {
        return  this.ticketRepository.create(entity, context);
    //     const participantArr = [];
    //     const messageArr = [];
    //     const ticketResponse :any= await this.ticketRepository.create(entity, context);
    //    const ticketValue:any =ticketResponse.data?.value
    //    if(ticketValue!=undefined){
    //     await Promise.all(entity.messages.map(async (message) => {
    //         const { attachments, ...msgBody } = message;
    //         let messageAttachment=[];
    //         const messageResponse:any = await this.messageRepository.create({ ...ticketValue,...msgBody }, context);
    //         await Promise.all(attachments.map(async (attachment) => {
               
    //             const {id}=messageResponse.data?.value
    //             const attachmentResponse :any= await this.attachmentRepository.create({ messageId:id,... attachment }, context);
    //             const attachmentValue=attachmentResponse.data?.value
    //             messageAttachment.push(attachmentValue)
    //         }))
    //         const messageValue=messageResponse.data?.value
    //         messageArr.push({ ...messageValue, attachments: messageAttachment })

    //     }))

    //     await Promise.all(entity.participants.map(async (participant) => {
    //         const participantResponse :any= await this.participantRepository.create({ ...participant, ...ticketValue }, context)
    //         const participantValue=participantResponse.data?.value
    //         participantArr.push(participantValue)
    //     }))
    // }
      

     
    
    //     let val = {
    //         ...ticketValue
    //         , messages: messageArr
    //         , participants: participantArr
    //     }

    //     return { type: 'ok', data: { type: 'resource', value: val } };
    
   
    }

    update = (id: Uuid, entity: Tickets, context:IContext): Promise<Result<Tickets>> => this.ticketRepository.update(id, entity, context);


    delete = (id: Uuid, context: IContext): Promise<Result<Tickets>> => this.ticketRepository.delete(id, context);
}