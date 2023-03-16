import { FastifyHttpProvider } from './fastify.httpprovider';

describe('Fastify Instantion Test', ()=>{
    it('Accepts options', ()=>{
        expect(new FastifyHttpProvider({ logger: true})).toBeInstanceOf(FastifyHttpProvider);
    })
})
