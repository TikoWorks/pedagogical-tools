/**
 * Host-näkymän E2E-testit.
 *
 * Tarkoitus: varmistaa, että isännän (opettajan) näkymä toimii: tyhjä tila,
 * sanapilven nollaus ja session nimen muokkaus validointeineen.
 *
 * Kattaa:
 * - tyhjän sanapilven tilaviestin
 * - Reset-dialogin avaamisen, peruutuksen ja vahvistuksen (DELETE /api/submission)
 * - session nimen tallennuksen blurilla (PATCH /api/session)
 * - tyhjän ja pelkistä välilyönneistä koostuvan nimen hylkäämisen (TV-08, TV-10)
 *
 * Ei kata: opiskelijan näkymää (ks. participant.cy.ts).
 */

describe('Host-näkymä', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.get('[data-testid="session-name-input"]').type('Cypress host test');
        cy.get('[data-testid="start-session"]').click();

        cy.url().should('include', '/host/');
    });

    // Tarkoitus: uusi sessio näyttää tyhjän tilan eikä sanoja.
    it('näyttää tyhjän tilan, kun sanoja ei ole', () => {
        cy.contains('No words yet').should('be.visible');
    });

    // Tarkoitus: Reset ei tuhoa dataa ilman vahvistusta; Cancel sulkee dialogin.
    it('Reset avaa vahvistuksen ja Cancel sulkee sen', () => {
        cy.contains('button', 'Reset').click();
        cy.contains('Reset word cloud?').should('be.visible');
        cy.contains('button', 'Cancel').click();
        cy.contains('Reset word cloud?').should('not.exist');
    });

    // Tarkoitus: vahvistettu Reset kutsuu rajapintaa ja tyhjentää näkymän.
    it('Reset kutsuu DELETE /api/submission ja sulkee dialogin', () => {
        cy.intercept('DELETE', '/api/submission').as('reset');
        cy.contains('button', 'Reset').click();
        cy.contains('Reset word cloud?').parent().contains('button', 'Reset').click();
        cy.wait('@reset').its('response.statusCode').should('eq', 200);
        cy.contains('Reset word cloud?').should('not.exist');
        cy.contains('No words yet').should('be.visible');
    });

    // Tarkoitus: kelvollinen uusi nimi tallentuu blurilla ja päivittyy otsikkoon.
    it('nimen vaihto tallentuu blurilla ja päivittyy otsikkoon', () => {
        cy.intercept('PATCH', '/api/session').as('rename');
        cy.get('[data-testid="session-name-input"]').clear().type('Uusi nimi').blur();
        cy.wait('@rename').its('response.statusCode').should('eq', 200);
        cy.get('h2').should('contain', 'Uusi nimi');
    });

    // Tarkoitus: tyhjää nimeä ei lähetetä palvelimelle ja käyttäjä saa virheen (TV-08, TV-10).
    it('tyhjä nimi näyttää virheen eikä lähetä PATCH-kutsua', () => {
        cy.intercept('PATCH', '/api/session').as('rename');

        cy.get('[data-testid="session-name-input"]').clear().blur();

        cy.contains('Session name is required').should('be.visible');
        cy.get('@rename.all').should('have.length', 0);
    });

    // Tarkoitus: pelkät välilyönnit käsitellään tyhjänä nimenä (TV-08, TV-10).
    it('pelkät välilyönnit hylätään eikä PATCH-kutsua lähde', () => {
        cy.intercept('PATCH', '/api/session').as('rename');

        cy.get('[data-testid="session-name-input"]').clear().type('   ').blur();

        cy.contains('Session name is required').should('be.visible');
        cy.get('@rename.all').should('have.length', 0);
    });
});
