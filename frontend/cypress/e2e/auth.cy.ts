// describe('Authentication Flow', () => {
//   beforeEach(() => {
//     cy.visit('/');
//   });

//   it('should navigate to login page', () => {
//     cy.get('[data-testid="login-button"]').click();
//     cy.url().should('include', '/login');
//     cy.contains('Login').should('be.visible');
//   });

//   it('should navigate to register page', () => {
//     cy.get('[data-testid="register-button"]').click();
//     cy.url().should('include', '/register');
//     cy.contains('Register').should('be.visible');
//   });

//   it('should display login form elements', () => {
//     cy.visit('/login');
//     cy.get('input[type="text"]').should('be.visible');
//     cy.get('input[type="password"]').should('be.visible');
//     cy.get('button[type="submit"]').should('be.visible');
//   });

//   it('should display register form elements', () => {
//     cy.visit('/register');
//     cy.get('input[type="text"]').should('be.visible');
//     cy.get('input[type="email"]').should('be.visible');
//     cy.get('input[type="password"]').should('be.visible');
//     cy.get('button[type="submit"]').should('be.visible');
//   });

//   it('should show validation errors for empty login form', () => {
//     cy.visit('/login');
//     cy.get('button[type="submit"]').click();
//     cy.get('form').should('contain.text', 'required').or('contain.text', 'Invalid');
//   });

//   it('should show validation errors for empty register form', () => {
//     cy.visit('/register');
//     cy.get('button[type="submit"]').click();
//     cy.get('form').should('contain.text', 'required').or('contain.text', 'Invalid');
//   });

//   it('should navigate to forgot password page', () => {
//     cy.visit('/login');
//     cy.contains('Forgot Password').click();
//     cy.url().should('include', '/forgot_password');
//   });

//   it('should display forgot password form', () => {
//     cy.visit('/forgot_password');
//     cy.get('input[type="email"]').should('be.visible');
//     cy.get('button[type="submit"]').should('be.visible');
//   });
// });