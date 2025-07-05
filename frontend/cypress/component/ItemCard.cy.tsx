import React from 'react';
import ItemCard from '../../src/components/ItemCard';
import { mockItem } from '../support/mocks/mockItem';

describe('<ItemCard />', () => {

  it('renders item details correctly', () => {
    cy.mount(<ItemCard item={mockItem} />);
    cy.get('h4').should('contain.text', 'Wooden Chair');
    cy.contains('Used').should('exist');
    cy.contains('Furniture').should('exist');
    cy.get('img').should('have.attr', 'src').and('include', 'test-image.jpg');
  });

  it('links to the correct item detail page', () => {
    cy.mount(<ItemCard item={mockItem} />);
    cy.get('a').should('have.attr', 'href', `/view_product/${mockItem.id}`);
  });

  it('has hover effect styling', () => {
    cy.mount(<ItemCard item={mockItem} />);
    cy.get('[data-cy="item-card"]').first().should('have.class', 'hover:shadow-lg');
  });
});