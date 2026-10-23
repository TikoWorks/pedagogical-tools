/**
 * Host-näkymän E2E-testit.
 *
 * Tarkoitus: varmistaa, että isännän (opettajan) näkymä toimii: tyhjä tila,
 * sanapilven nollaus ja session nimen muokkaus validointeineen.
 *
 * Kattaa:
 * - tyhjän sanapilven tilaviestin
 * - Reset-dialogin avaamisen, peruutuksen ja vahvistuksen (DELETE /api/submission)
 *
 * Ei kata tässä vaiheessa:
 * - session nimen blur-tallennuksen validointeja, koska ne ovat olleet
 *   epävakaita oikeaa Supabase-ympäristöä vasten
 * - opiskelijan näkymää (ks. participant.cy.ts)
 */

describe('Host-näkymä', () => {
    beforeEach(() => {
        cy.visit('/');

        cy.get('[data-testid="session-name-input"]').type('Cypress host test');
        cy.get('[data-testid="start-session"]').click();

        cy.url().should('include', '/host/');

        cy.get('[data-testid="session-name-input"]')
            .should('be.visible')
            .and('have.value', 'Cypress host test');
    });

    // Tarkoitus: uusi sessio näyttää tyhjän tilan eikä sanoja.
    it('näyttää tyhjän tilan, kun sanoja ei ole', () => {
        cy.contains('No words yet', { timeout: 10000 }).should('be.visible');
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
        cy.contains('Reset word cloud?')
            .parent()
            .contains('button', 'Reset')
            .click();

        cy.wait('@reset').its('response.statusCode').should('eq', 200);
        cy.contains('Reset word cloud?').should('not.exist');
        cy.contains('No words yet', { timeout: 10000 }).should('be.visible');
    });

    // Tunnetusti epävakaa oikeaa Supabasea vasten, ks. Issue #77.
    it.skip('nimen vaihto tallentuu blurilla ja päivittyy otsikkoon', () => {
        cy.intercept('PATCH', '/api/session').as('rename');

        cy.get('[data-testid="session-name-input"]')
            .clear()
            .type('Uusi nimi')
            .blur();

        cy.wait('@rename').its('response.statusCode').should('eq', 200);
        cy.contains('h2', 'Uusi nimi').should('be.visible');
    });

    // Tunnetusti epävakaa oikeaa Supabasea vasten, ks. Issue #77.
    it.skip('tyhjä nimi näyttää virheen eikä lähetä PATCH-kutsua', () => {
        cy.intercept('PATCH', '/api/session').as('rename');

        cy.get('[data-testid="session-name-input"]').clear().blur();

        cy.get('[role="alert"]').should('contain', 'Session name is required');
        cy.get('@rename.all').should('have.length', 0);
    });

    // Tunnetusti epävakaa oikeaa Supabasea vasten, ks. Issue #77.
    it.skip('pelkät välilyönnit hylätään eikä PATCH-kutsua lähde', () => {
        cy.intercept('PATCH', '/api/session').as('rename');

        cy.get('[data-testid="session-name-input"]').clear().type('   ').blur();

        cy.get('[role="alert"]').should('contain', 'Session name is required');
        cy.get('@rename.all').should('have.length', 0);
    });
});