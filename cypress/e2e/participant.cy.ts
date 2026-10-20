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
