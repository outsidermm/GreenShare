describe('Offers Management', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display manage offers page', () => {
    cy.visit('/manage_offers');
    cy.contains('Manage Offers').should('be.visible');
  });

  it('should show offers tabs', () => {
    cy.visit('/manage_offers');
    cy.contains('Incoming Offers').should('be.visible');
    cy.contains('Outgoing Offers').should('be.visible');
  });

  it('should switch between offer tabs', () => {
    cy.visit('/manage_offers');
    cy.contains('Incoming Offers').click();
    cy.get('[data-testid="incoming-offers"]').should('be.visible');
    
    cy.contains('Outgoing Offers').click();
    cy.get('[data-testid="outgoing-offers"]').should('be.visible');
  });

  it('should display offer actions', () => {
    cy.visit('/manage_offers');
    cy.get('[data-testid="offer-card"]').first().within(() => {
      cy.get('button').should('have.length.greaterThan', 0);
    });
  });

  it('should show offer details', () => {
    cy.visit('/manage_offers');
    cy.get('[data-testid="offer-card"]').first().within(() => {
      cy.get('[data-testid="offer-message"]').should('be.visible');
      cy.get('[data-testid="offer-status"]').should('be.visible');
      cy.get('[data-testid="offer-date"]').should('be.visible');
    });
  });

  it('should display offer form validation', () => {
    cy.visit('/add_offer/1');
    cy.get('button[type="submit"]').click();
    cy.get('form').should('contain.text', 'required').or('contain.text', 'Invalid');
  });

  it('should show confirmation modal for offer actions', () => {
    cy.visit('/manage_offers');
    cy.get('[data-testid="accept-offer-btn"]').first().click();
    cy.get('[data-testid="confirmation-modal"]').should('be.visible');
  });
});