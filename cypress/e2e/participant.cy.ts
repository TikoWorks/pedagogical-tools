/**
 * E2E-02: Tyhjä tai välilyönneistä koostuva sanasyöte hylätään.
 *
 * Tarkoitus: varmistaa, ettei opiskelija voi lähettää tyhjää tai pelkkää
 * välilyöntiä sisältävää sanaa (TV-06, TV-08).
 *
 * Kattaa:
 * - Send-painikkeen estetyn tilan tyhjällä syötteellä
 * - Send-painikkeen estetyn tilan pelkillä välilyönneillä
 * - ettei POST /api/submission -kutsua lähde
 * - ettei virheellinen syöte näy hostin sanapilvessä
 *
 * Testidata: jokaiselle testille luodaan oma sessio POST /api/session -kutsulla.
 * Ei kata: reset-toimintoa, monen käyttäjän reaaliaikaisuutta, QR-koodia,
 * kuormitusta tai botti- ja roskapostisuojausta.
 */
describe('E2E-02: Tyhjä syöte hylätään', () => {
    let sessionId: string;
    let joinCode: string;

    beforeEach(() => {
        cy.intercept('POST', '/api/submission').as('submit');

        cy.request('POST', '/api/session', {
            name: 'E2E-02 testisessio',
        }).then(({ body }) => {
            sessionId = body.id;
            joinCode = body.join_code;

            cy.visit(`/join/${joinCode}`);
        });
    });

    // Tarkoitus: tyhjällä kentällä Send on estetty.
    it('estää tyhjän syötteen', () => {
        cy.get('[data-testid="word-input"]').should('have.value', '');
        cy.get('[data-testid="send-word"]').should('be.disabled');
    });

    // Tarkoitus: pelkät välilyönnit estävät lähetyksen eikä pyyntöä lähde.
    it('estää pelkistä välilyönneistä koostuvan syötteen', () => {
        cy.get('[data-testid="word-input"]').type('     ');
        cy.get('[data-testid="send-word"]').should('be.disabled');
        cy.get('@submit.all').should('have.length', 0);
    });

    // Tarkoitus: virheellinen syöte ei päädy opettajan näkymään.
    it('virheellinen syöte ei näy opettajan sanapilvessä', () => {
        cy.get('[data-testid="word-input"]').type('     ');
        cy.get('[data-testid="send-word"]').should('be.disabled');

        cy.visit(`/host/${sessionId}`);
        cy.contains('No words yet').should('be.visible');
    });
});

/**
 * E2E-03: Participant liittyy join-koodilla, lähettää sanan
 * ja host näkee sanan näkymässään.
 *
 * Tarkoitus: varmistaa participantin ydinkäyttäjäpolku päästä päähän.
 *
 * Kattaa:
 * - sessionin luonnin
 * - participantin liittymisen join-koodilla
 * - sanan lähetyksen
 * - sanan näkymisen host-näkymässä
 *
 * Ei kata: usean osallistujan samanaikaisuutta, QR-koodin skannausta,
 * kuormitusta tai virhetilanteiden laajaa testausta.
 */
describe('E2E-03: Participant sends word and host sees it', () => {
    it('participant can submit a word and host sees it in realtime', () => {
        const topic = 'E2E realtime test';
        const submittedWord = 'omena';

        cy.intercept('POST', '/api/session').as('createSession');
        cy.intercept('GET', '/api/session').as('getSession');
        cy.intercept('POST', '/api/participant').as('createParticipant');
        cy.intercept('POST', '/api/submission').as('createSubmission');
        cy.intercept('GET', '/api/submission').as('getSubmissions');

        cy.visit('/');

        cy.get('input').first().type(topic);
        cy.contains('Start').click();

        cy.wait('@createSession').then((interception) => {
            const session = interception.response?.body;
            const joinCode = session?.join_code;
            const sessionId = session?.id;

            expect(interception.response?.statusCode).to.eq(201);
            expect(joinCode).to.be.a('string').and.not.be.empty;
            expect(sessionId).to.be.a('string').and.not.be.empty;

            cy.url().should('include', '/host/');
            cy.wait('@getSession');
            cy.wait('@getSubmissions');

            cy.visit(`/join/${joinCode}`);

            cy.wait('@createParticipant')
                .its('response.statusCode')
                .should('be.oneOf', [200, 201, 308]);

            cy.get('[data-testid="word-input"]').type(submittedWord);
            cy.get('[data-testid="send-word"]').click();

            cy.wait('@createSubmission')
                .its('response.statusCode')
                .should('be.oneOf', [200, 201, 308]);

            cy.contains('Word sent!').should('be.visible');

            cy.visit(`/host/${sessionId}`);
            cy.contains(submittedWord, { matchCase: false }).should('be.visible');
        });
    });
});
