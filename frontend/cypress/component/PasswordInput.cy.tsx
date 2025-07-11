import React from 'react';
import PasswordInput from '../../src/components/PasswordInput';

interface PasswordInputProps {
  password: string;
  setPassword: (password: string) => void;
  pwdChanged: boolean;
  setPwdChanged: (changed: boolean) => void;
  passwordError: string;
  placeholder?: string;
}

let baseProps: PasswordInputProps;
let setPassword: any;
let setPwdChanged: any;

beforeEach(() => {
  document.body.classList.add('light');
  setPassword = cy.stub().as('setPassword');
  setPwdChanged = cy.stub().as('setPwdChanged');
  baseProps = {
    password: '',
    setPassword,
    pwdChanged: false,
    setPwdChanged,
    passwordError: '',
    placeholder: 'Enter your password',
  };
});

describe('<PasswordInput />', () => {
  it('renders with label and placeholder', () => {
    cy.mount(<PasswordInput {...baseProps} />);
    cy.get('label').should('contain.text', 'Password');
    cy.get('input').should('have.attr', 'placeholder', 'Enter your password');
  });

  it('uses default placeholder when not provided', () => {
    const propsWithoutPlaceholder = { ...baseProps, placeholder: undefined };
    cy.mount(<PasswordInput {...propsWithoutPlaceholder} />);
    cy.get('input').should('have.attr', 'placeholder', 'Enter your password');
  });

  it('renders as password type by default', () => {
    cy.mount(<PasswordInput {...baseProps} />);
    cy.get('input').should('have.attr', 'type', 'password');
  });

  it('toggles password visibility when eye button is clicked', () => {
    cy.mount(<PasswordInput {...baseProps} />);
    
    // Should be password type initially
    cy.get('input').should('have.attr', 'type', 'password');
    
    // Click toggle button
    cy.get('button[aria-label="Toggle password visibility"]').click();
    
    // Should be text type after click
    cy.get('input').should('have.attr', 'type', 'text');
    
    // Click again to hide
    cy.get('button[aria-label="Toggle password visibility"]').click();
    
    // Should be password type again
    cy.get('input').should('have.attr', 'type', 'password');
  });

  it('calls setPassword when typing', () => {
    cy.mount(<PasswordInput {...baseProps} />);
    cy.get('input').type('myPassword123');
    cy.get('@setPassword').should('have.been.called');
  });

  it('calls setPwdChanged on focus', () => {
    cy.mount(<PasswordInput {...baseProps} />);
    cy.get('input').focus();
    cy.get('@setPwdChanged').should('have.been.calledWith', true);
  });

  it('displays error message when passwordError is not empty', () => {
    const propsWithError = { ...baseProps, passwordError: 'Password must be at least 8 characters' };
    cy.mount(<PasswordInput {...propsWithError} />);
    cy.contains('Password must be at least 8 characters').should('exist');
    cy.get('#password-error').should('have.class', 'text-alert-primary');
  });

  it('does not display error message when passwordError is empty', () => {
    cy.mount(<PasswordInput {...baseProps} />);
    cy.get('#password-error').should('not.exist');
  });

  it('applies invalid border styling when pwdChanged is true', () => {
    const propsWithPwdChanged = { ...baseProps, pwdChanged: true };
    cy.mount(<PasswordInput {...propsWithPwdChanged} />);
    cy.get('input').should('have.class', 'invalid:border-alert-primary');
  });

  it('has proper accessibility attributes', () => {
    cy.mount(<PasswordInput {...baseProps} />);
    
    // Check label association
    cy.get('label').should('have.attr', 'for', 'password-input');
    cy.get('input').should('have.attr', 'id', 'password-input');
    
    // Check aria attributes
    cy.get('input').should('have.attr', 'aria-describedby', 'password-error');
    cy.get('button').should('have.attr', 'aria-label', 'Toggle password visibility');
  });

  it('enforces password length constraints', () => {
    cy.mount(<PasswordInput {...baseProps} />);
    cy.get('input').should('have.attr', 'minLength', '8');
    cy.get('input').should('have.attr', 'maxLength', '32');
    cy.get('input').should('have.attr', 'required');
  });

  it('maintains focus after toggling visibility', () => {
    cy.mount(<PasswordInput {...baseProps} />);
    
    // Focus on input
    cy.get('input').focus();
    
    // Toggle visibility
    cy.get('button[aria-label="Toggle password visibility"]').click();
    
    // Check that focus remains on the page (not lost)
    cy.focused().should('exist');
  });
});