import React from 'react';
import CredentialsInput from '../../src/components/CredentialsInput';

interface CredentialsInputProps {
  type: string;
  placeholder: string;
  minLength: number;
  maxLength: number;
  required: boolean;
  credential: string;
  setCredential: (credential: string) => void;
  credentialChanged: boolean;
  setCredentialChanged: (changed: boolean) => void;
  credentialError: string;
  label: string;
}

let baseProps : CredentialsInputProps;
let setCredential;
let setCredentialChanged;

beforeEach(() => {
  setCredential = cy.stub().as('setCredential');
  document.body.classList.add('light');
  setCredentialChanged = cy.stub().as('setCredentialChanged');
  baseProps = {
    type: 'text',
    placeholder: 'Enter username',
    minLength: 3,
    maxLength: 20,
    required: true,
    credential: '',
    setCredential,
    credentialChanged: false,
    setCredentialChanged,
    credentialError: '',
    label: 'Username',
  };
});

describe('<CredentialsInput />', () => {
  it('renders label and placeholder correctly', () => {
    cy.mount(<CredentialsInput {...baseProps} />);
    cy.get('label').should('contain.text', 'Username');
    cy.get('input').should('have.attr', 'placeholder', 'Enter username');
  });

  it('triggers setCredential on change', () => {
    cy.mount(<CredentialsInput {...baseProps} />);
    cy.get('input').type('user123');
    cy.get('@setCredential').should('have.been.called');
  });

  it('triggers setCredentialChanged on focus', () => {
    cy.mount(<CredentialsInput {...baseProps} />);
    cy.get('input').focus();
    cy.get('@setCredentialChanged').should('have.been.calledWith', true);
  });

  it('shows error message when credentialError is not empty', () => {
    const propsWithError = { ...baseProps, credentialError: 'Invalid input' };
    cy.mount(<CredentialsInput {...propsWithError} />);
    cy.contains('Invalid input').should('exist');
  });
});