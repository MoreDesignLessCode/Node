import { Uuid, parseUuid } from './id';

describe('Uuid Parseing Test', ()=> {
    it('should fail when not a number', () => {
        expect(()=>{
            parseUuid('5');
        }).toThrow();
    });
    it('should fail when invalid', ()=>{
        expect(()=>{
            parseUuid('4b9b3fd2-a5f7-42b2-a5d7-c571913c7594a');
        }).toThrow()
    });
    it('should pass', ()=>{
        expect(()=> parseUuid(Uuid())).toBeTruthy();
    });
});
