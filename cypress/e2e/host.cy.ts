describe('Host-näkymä', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.get('[data-testid="session-name-input"]').type('Cypress host test');
        cy.get('[data-testid="start-session"]').click();

        cy.url().should('include', '/host/');
    });

    it('näyttää tyhjän tilan, kun sanoja ei ole', () => {
        cy.contains('No words yet').should('be.visible');
    });

    it('Reset avaa vahvistuksen ja Cancel sulkee sen', () => {
        cy.contains('button', 'Reset').click();
        cy.contains('Reset word cloud?').should('be.visible');
        cy.contains('button', 'Cancel').click();
        cy.contains('Reset word cloud?').should('not.exist');
    });

    it('Reset kutsuu DELETE /api/submission ja sulkee dialogin', () => {
        cy.intercept('DELETE', '/api/submission').as('reset');
        cy.contains('button', 'Reset').click();
        cy.contains('Reset word cloud?')
            .parent()
            .contains('button', 'Reset')
            .click();
        cy.wait('@reset').its('response.statusCode').should('eq', 200);
        cy.contains('Reset word cloud?').should('not.exist');
        cy.contains('No words yet').should('be.visible');
    });

    it('nimen vaihto tallentuu blurilla ja päivittyy otsikkoon', () => {
        cy.intercept('PATCH', '/api/session').as('rename');
        cy.get('[data-testid="session-name-input"]').clear().type('Uusi nimi').blur();
        cy.wait('@rename').its('response.statusCode').should('eq', 200);
        cy.get('h2').should('contain', 'Uusi nimi');
    });

    // Odottaa korjausta: Issue #XX (tyhjää nimeä ei validoida)
    it.skip('tyhjä nimi näyttää virheen eikä lähetä PATCH-kutsua', () => {
        cy.intercept('PATCH', '/api/session').as('rename');
        cy.get('input[type="text"]').clear().blur();
        cy.contains('Session name is required').should('be.visible');
        cy.get('@rename.all').should('have.length', 0);
    });
});
