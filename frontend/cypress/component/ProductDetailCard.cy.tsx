import React from 'react';
import ProductDetailCard from '../../src/components/ProductDetailCard';
import { mockItem } from '../support/mocks/mockItem';
import { toTitleCase } from '@/utils/titleCase';


before(() => {
  document.body.classList.add('light');
});

describe('<ProductDetailCard />', () => {

  it('renders item title, category, and description correctly', () => {
    cy.mount(<ProductDetailCard item={mockItem} />);
    cy.contains(toTitleCase('wooden chair')).should('exist');
    cy.contains(toTitleCase('furniture')).should('exist');
  });

  it('renders approximate location when approximate_loc is true', () => {
    cy.mount(<ProductDetailCard item={mockItem} approximate_loc={true} />);
    cy.contains(toTitleCase('Australia')).should('exist');
  });

  it('renders type, status, and condition correctly', () => {
    cy.mount(<ProductDetailCard item={mockItem} />);
    cy.contains(toTitleCase('home')).should('exist');
    cy.contains(toTitleCase('available')).should('exist');
    cy.contains(toTitleCase('used')).should('exist');
  });
});