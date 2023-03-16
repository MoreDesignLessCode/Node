import { parseUuid } from '@procter-gamble/apip-api-types';
import { PersonSchema } from './person';

describe('person validation tests', () => {
    it.each`
        testName                                             | person
        ${'id should allow null'}                            | ${{ id: null, name: { display: 'Joe Developer', given: 'Joe', middle: '', family: 'Developer' } }}
        ${'id should allow null by not passing it'}          | ${{ name: { display: 'Joe Developer', given: 'Joe', middle: '', family: 'Developer' } }}
        ${'middle name should allow empty'}                  | ${{ id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'), name: { display: 'Joe Developer', given: 'Joe', middle: '', family: 'Developer' } }}
        ${'middle name should allow null'}                   | ${{ id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'), name: { display: 'Joe Developer', given: 'Joe', middle: null, family: 'Developer' } }}
        ${'middle name should allow null by not passing it'} | ${{ id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'), name: { display: 'Joe Developer', given: 'Joe', family: 'Developer' } }}
    `('$testName', async ({ person }) => {
        const { error } = PersonSchema.validate(person);
        expect(error).toBeUndefined();
    });
});
