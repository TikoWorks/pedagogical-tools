// Ensimmäinen Smoke -testi

// Määritellään testikokonaisuus (suite), joka käsittelee session luomista
describe('Sessionin luominen', () => {

    // Määritellään yksittäinen testi, joka tarkistaa session luomisen ja siirtymisen host-näkymään
    it('luo uuden session ja siirtyy host-näkymään', () => {

        // Määritellään session nimi, jota käytetään testissä
        const sessionName = 'Cypress smoke test';

        // Käydään sovelluksen etusivulla
        cy.visit('/');

        // Varmistetaan, että session nimen syöttökenttä on näkyvissä ja kirjoitetaan siihen session nimi
        cy.get('input[name="name"]')
            .should('be.visible')
            .type(sessionName);

        // Varmistetaan, että aloituspainike on näkyvissä ja klikataan sitä
        cy.get('[data-testid="start-session"]')
            .should('be.visible')
            .click();

        // Varmistetaan, että URL sisältää '/host/', mikä tarkoittaa, että siirryttiin host-näkymään
        cy.url().should('include', '/host/');

        // Varmistetaan, että host-näkymässä näkyy luodun session nimi
        cy.contains(sessionName).should('be.visible');
    });
});
