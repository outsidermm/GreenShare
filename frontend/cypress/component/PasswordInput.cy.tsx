// import React from 'react';
// import PasswordInput from '../../src/components/PasswordInput';

// interface PasswordInputProps {
//   password: string;
//   setPassword: (password: string) => void;
//   passwordChanged: boolean;
//   setPasswordChanged: (changed: boolean) => void;
//   passwordError: string;
//   label: string;
//   required?: boolean;
//   minLength?: number;
// }

// let baseProps: PasswordInputProps;
// let setPassword: any;
// let setPasswordChanged: any;

// beforeEach(() => {
//   setPassword = cy.stub().as('setPassword');
//   setPasswordChanged = cy.stub().as('setPasswordChanged');
//   document.body.classList.add('light');
  
//   baseProps = {
//     password: '',
//     setPassword,
//     passwordChanged: false,
//     setPasswordChanged,
//     passwordError: '',
//     label: 'Password',
//     required: true,
//     minLength: 8,
//   };
// });

// describe('<PasswordInput />', () => {
//   it('renders password input with label', () => {
//     cy.mount(<PasswordInput {...baseProps} />);
//     cy.get('label').should('contain.text', 'Password');
//     cy.get('input[type="password"]').should('be.visible');
//   });

//   it('toggles password visibility', () => {
//     cy.mount(<PasswordInput {...baseProps} />);
//     cy.get('input[type="password"]').should('be.visible');
//     cy.get('[data-testid="toggle-password"]').click();
//     cy.get('input[type="text"]').should('be.visible');
//     cy.get('[data-testid="toggle-password"]').click();
//     cy.get('input[type="password"]').should('be.visible');
//   });

//   it('calls setPassword on input change', () => {
//     cy.mount(<PasswordInput {...baseProps} />);
//     cy.get('input').type('newpassword');
//     cy.get('@setPassword').should('have.been.called');
//   });

//   it('calls setPasswordChanged on focus', () => {
//     cy.mount(<PasswordInput {...baseProps} />);
//     cy.get('input').focus();
//     cy.get('@setPasswordChanged').should('have.been.calledWith', true);
//   });

//   it('displays error message', () => {
//     const propsWithError = { ...baseProps, passwordError: 'Password too short' };
//     cy.mount(<PasswordInput {...propsWithError} />);
//     cy.contains('Password too short').should('be.visible');
//   });

//   it('applies required styling when required', () => {
//     cy.mount(<PasswordInput {...baseProps} required={true} />);
//     cy.get('input').should('have.attr', 'required');
//   });

//   it('handles password strength validation', () => {
//     cy.mount(<PasswordInput {...baseProps} />);
//     cy.get('input').type('weak');
//     cy.get('input').type('strongpassword123');
//     cy.get('@setPassword').should('have.been.called');
//   });
// });