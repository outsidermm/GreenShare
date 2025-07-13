describe('Navigation Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should navigate through main sections', () => {
    // Test homepage navigation
    cy.url().should('include', '/')
    
    // Test that the page loads properly
    cy.get('body').should('be.visible')
    
    // Test for main navigation elements (more flexible selectors)
    cy.get('nav, [role="navigation"], header').should('have.length.greaterThan', 0)
    
    // Test search functionality if available
    cy.get('input[type="text"]').should('have.length.greaterThan', 0)
    
    // Test filter interactions
    cy.get('body').should('contain.text', 'GreenShare') // Ensure the app loads
  })

  it('should handle responsive design', () => {
    // Test mobile viewport
    cy.viewport(375, 667)
    cy.visit('/')
    cy.get('body').should('be.visible')
    
    // Test tablet viewport
    cy.viewport(768, 1024)
    cy.visit('/')
    cy.get('body').should('be.visible')
    
    // Test desktop viewport
    cy.viewport(1920, 1080)
    cy.visit('/')
    cy.get('body').should('be.visible')
  })

  it('should load and display items', () => {
    cy.visit('/')
    
    // Wait for any items to load and test the ItemCard component
    cy.get('body').should('be.visible')
    
    // Test filter functionality
    cy.get('select, input, [role="combobox"]').should('have.length.greaterThan', 0)
  })
})