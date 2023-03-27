import { parseUuid } from '@cvshealth/apip-api-types';

export const testPersonsData = [
    {
        id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
        name: {
            display: 'Joe Developer',
            given: 'Joe',
            middle: '',
            family: 'Developer',
        },
    },
    {
        id: parseUuid('cef35b6e-056d-43b9-b707-3fe568c3ab65'),
        name: {
            display: 'Brandon Schenz',
            given: 'Brandon',
            middle: '',
            family: 'Schenz',
        },
    },
    {
        id: parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
        name: {
            display: 'Tyler Bosh',
            given: 'Tyler',
            middle: '',
            family: 'Bosh',
        },
    },
];

export const testUpdatePersonData = {
    id: parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
    name: {
        display: 'Tye Bosh',
        given: 'Tye',
        middle: '',
        family: 'Bosh',
    },
};

export const testPersonData = {
    id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
    name: {
        display: 'Joe Developer',
        given: 'Joe',
        middle: '',
        family: 'Developer',
    },
};

export const testNewPersonData = {
    id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab8'),
    name: {
        display: 'Joe Schmoe',
        given: 'Joe',
        middle: '',
        family: 'Schmoe',
    },
};
