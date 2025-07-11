import React from 'react';
import LocationSelect from '../../src/components/LocationSelect';
import { Option } from '@/types/option';

interface LocationSelectProps {
  value: Option | null;
  onChange: (value: Option | null) => void;
  placeholder?: string;
  required?: boolean;
}

let baseProps: LocationSelectProps;
let onChange: any;

beforeEach(() => {
  document.body.classList.add('light');
  onChange = cy.stub().as('onChange');
  baseProps = {
    value: null,
    onChange,
    placeholder: 'Search for a location...',
    required: true,
  };

  // Mock the autocompleteAddress API call
  cy.intercept('GET', '**/api/autocomplete_address?*', {
    statusCode: 200,
    body: {
      predictions: [
        {
          place_id: 'place1',
          description: '123 Main St, Sydney NSW 2000, Australia',
        },
        {
          place_id: 'place2',
          description: '456 George St, Melbourne VIC 3000, Australia',
        },
        {
          place_id: 'place3',
          description: '789 Queen St, Brisbane QLD 4000, Australia',
        },
      ],
    },
  }).as('autocompleteRequest');
});

describe('<LocationSelect />', () => {
  it('renders with label and placeholder', () => {
    cy.mount(<LocationSelect {...baseProps} />);
    cy.get('label').should('contain.text', 'Location');
    cy.get('input').should('have.attr', 'placeholder', 'Search for a location...');
  });

  it('shows message when typing less than 3 characters', () => {
    cy.mount(<LocationSelect {...baseProps} />);
    cy.get('input').type('ab');
    cy.get('input').click();
    cy.contains('Type at least 3 characters to search').should('exist');
  });

  it('fetches and displays location suggestions when typing 3+ characters', () => {
    cy.mount(<LocationSelect {...baseProps} />);
    cy.get('input').type('syd');
    cy.wait('@autocompleteRequest');
    cy.get('input').click();
    cy.contains('123 Main St, Sydney NSW 2000, Australia').should('exist');
    cy.contains('456 George St, Melbourne VIC 3000, Australia').should('exist');
    cy.contains('789 Queen St, Brisbane QLD 4000, Australia').should('exist');
  });

  it('calls onChange when selecting a location', () => {
    cy.mount(<LocationSelect {...baseProps} />);
    cy.get('input').type('syd');
    cy.wait('@autocompleteRequest');
    cy.get('input').click();
    cy.contains('123 Main St, Sydney NSW 2000, Australia').click();
    cy.get('@onChange').should('have.been.calledWith', {
      value: 'place1',
      label: '123 Main St, Sydney NSW 2000, Australia',
    });
  });

  it('shows loading message while fetching', () => {
    cy.intercept('GET', '**/api/autocomplete_address?*', (req) => {
      req.reply((res) => {
        res.delay(1000); // Add delay to see loading state
        res.send({
          statusCode: 200,
          body: { predictions: [] },
        });
      });
    }).as('slowRequest');

    cy.mount(<LocationSelect {...baseProps} />);
    cy.get('input').type('test');
    cy.get('input').click();
    cy.contains('Searching locations...').should('exist');
  });

  it('handles API errors gracefully', () => {
    cy.intercept('GET', '**/api/autocomplete_address?*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    }).as('errorRequest');

    cy.mount(<LocationSelect {...baseProps} />);
    cy.get('input').type('error');
    cy.wait('@errorRequest');
    cy.get('input').click();
    cy.contains('No locations found').should('exist');
  });

  it('clears selection when clear button is clicked', () => {
    const propsWithValue = {
      ...baseProps,
      value: { value: 'place1', label: '123 Main St, Sydney NSW 2000, Australia' },
    };
    cy.mount(<LocationSelect {...propsWithValue} />);
    // React Select shows clear button when value is present
    cy.get('div[aria-label="Clear all"]').click();
    cy.get('@onChange').should('have.been.calledWith', null);
  });
});