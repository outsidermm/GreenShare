describe('Navigation Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display main navigation elements', () => {
    cy.get('nav').should('be.visible');
    cy.contains('GreenShare').should('be.visible');
  });

  it('should navigate to different categories', () => {
    const categories = ['electronics', 'clothing', 'books', 'sports'];
    
    categories.forEach(category => {
      cy.visit(`/category/${category}`);
      cy.url().should('include', `/category/${category}`);
      cy.contains(category, { matchCase: false }).should('be.visible');
    });
  });

  it('should display filter bar on category pages', () => {
    cy.visit('/category/electronics');
    cy.contains('Filtered Condition:').should('be.visible');
    cy.contains('Filtered Type:').should('be.visible');
  });

  it('should navigate to manage products page', () => {
    cy.visit('/manage_products');
    cy.url().should('include', '/manage_products');
    cy.contains('Manage Products').should('be.visible');
  });

  it('should navigate to manage offers page', () => {
    cy.visit('/manage_offers');
    cy.url().should('include', '/manage_offers');
    cy.contains('Manage Offers').should('be.visible');
  });

  it('should display responsive navigation', () => {
    cy.viewport('iphone-6');
    cy.visit('/');
    cy.get('nav').should('be.visible');
    
    cy.viewport('macbook-15');
    cy.visit('/');
    cy.get('nav').should('be.visible');
  });
});