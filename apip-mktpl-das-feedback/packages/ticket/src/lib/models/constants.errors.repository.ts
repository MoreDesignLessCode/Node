export const repository = {
    ticket: {
        storageProvider: {
            undefined: {
                CODE: 'TICKETS-DAS-4301',
                MESSAGE: 'Ticket Storage Provider is undefined',
                TITLE: 'Ticket Storage Provider is undefined',
            },
        },
        all: {
            CODE: 'TICKETS-DAS-4302',
            MESSAGE:
                'An unknown error occurred while getting ticket, please check root causes',
            TITLE: 'Error getting ticket from repository',
        },
        find: {
            CODE: 'TICKETS-DAS-4303',
            MESSAGE:
                'An unknown error occurred while getting ticket, please check root causes',
            TITLE: 'Error updating ticket from repository',
        },
        create: {
            CODE: 'TICKETS-DAS-4304',
            MESSAGE:
                'An unknown error occurred while creating ticket, please check root causes',
            TITLE: 'Error saving ticket to repository',
        },
        save: {
            CODE: 'TICKETS-DAS-4305',
            MESSAGE:
                'An unknown error occurred while saving ticket, please check root causes',
            TITLE: 'Error saving ticket to repository',
        },
        delete: {
            CODE: 'TICKETS-DAS-4306',
            MESSAGE:
                'An unknown error occurred while deleting ticket, please check root causes',
            TITLE: 'Error deleting ticket in repository',
        },
        innerDelete: {
            CODE: 'TICKETS-DAS-4307',
            MESSAGE:
                'An unknown error occurred while getting ticket after delete, please check root causes',
            TITLE: 'Error getting ticket from repository',
        },
    },
};
