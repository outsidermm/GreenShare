describe('Items Management', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display item cards on homepage', () => {
    cy.get('[data-testid="item-card"]').should('have.length.greaterThan', 0);
  });

  it('should navigate to item detail page', () => {
    cy.get('[data-testid="item-card"]').first().click();
    cy.url().should('include', '/view_product/');
    cy.get('[data-testid="product-detail"]').should('be.visible');
  });

  it('should display product details', () => {
    cy.visit('/view_product/1');
    cy.get('[data-testid="product-title"]').should('be.visible');
    cy.get('[data-testid="product-description"]').should('be.visible');
    cy.get('[data-testid="product-condition"]').should('be.visible');
    cy.get('[data-testid="product-location"]').should('be.visible');
  });

  it('should show make offer button on product detail page', () => {
    cy.visit('/view_product/1');
    cy.contains('Make Offer').should('be.visible');
  });

  it('should navigate to make offer page', () => {
    cy.visit('/view_product/1');
    cy.contains('Make Offer').click();
    cy.url().should('include', '/add_offer/1');
  });

  it('should display offer form', () => {
    cy.visit('/add_offer/1');
    cy.get('form').should('be.visible');
    cy.get('textarea').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should filter items by condition', () => {
    cy.visit('/category/electronics');
    cy.get('input').first().click();
    cy.contains('New').click();
    cy.get('[data-testid="item-card"]').should('have.length.greaterThan', -1);
  });

  it('should filter items by type', () => {
    cy.visit('/category/electronics');
    cy.get('input').eq(1).click();
    cy.contains('Phone').click();
    cy.get('[data-testid="item-card"]').should('have.length.greaterThan', -1);
  });

  it('should display item images', () => {
    cy.visit('/view_product/1');
    cy.get('[data-testid="product-image"]').should('be.visible');
  });
});