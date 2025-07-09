// import React from 'react';
// import LocationSelect from '../../src/components/LocationSelect';

// interface LocationSelectProps {
//   selectedLocation: any;
//   setSelectedLocation: (location: any) => void;
//   locationError: string;
//   label: string;
//   required?: boolean;
// }

// let baseProps: LocationSelectProps;
// let setSelectedLocation: any;

// beforeEach(() => {
//   setSelectedLocation = cy.stub().as('setSelectedLocation');
//   document.body.classList.add('light');
  
//   baseProps = {
//     selectedLocation: null,
//     setSelectedLocation,
//     locationError: '',
//     label: 'Location',
//     required: true,
//   };
// });

// describe('<LocationSelect />', () => {
//   it('renders location input field', () => {
//     cy.mount(<LocationSelect {...baseProps} />);
//     cy.get('label').should('contain.text', 'Location');
//     cy.get('input[type="text"]').should('be.visible');
//   });

//   it('handles location input change', () => {
//     cy.mount(<LocationSelect {...baseProps} />);
//     cy.get('input').type('New York');
//     cy.get('@setSelectedLocation').should('have.been.called');
//   });

//   it('displays error message when locationError is provided', () => {
//     const propsWithError = { ...baseProps, locationError: 'Location is required' };
//     cy.mount(<LocationSelect {...propsWithError} />);
//     cy.contains('Location is required').should('be.visible');
//   });

//   it('shows autocomplete suggestions', () => {
//     cy.mount(<LocationSelect {...baseProps} />);
//     cy.get('input').type('Sydney');
//     cy.get('.autocomplete-suggestions').should('be.visible');
//   });

//   it('handles location selection from suggestions', () => {
//     cy.mount(<LocationSelect {...baseProps} />);
//     cy.get('input').type('Sydney');
//     cy.get('.suggestion-item').first().click();
//     cy.get('@setSelectedLocation').should('have.been.called');
//   });

//   it('displays selected location', () => {
//     const propsWithLocation = {
//       ...baseProps,
//       selectedLocation: {
//         description: 'Sydney, NSW, Australia',
//         place_id: 'ChIJP3Sa8ziYEmsRUKgyFmh9AQM'
//       }
//     };
//     cy.mount(<LocationSelect {...propsWithLocation} />);
//     cy.get('input').should('have.value', 'Sydney, NSW, Australia');
//   });

//   it('shows loading state during autocomplete', () => {
//     cy.mount(<LocationSelect {...baseProps} />);
//     cy.get('input').type('Syd');
//     cy.get('.loading-indicator').should('be.visible');
//   });

//   it('handles required field validation', () => {
//     cy.mount(<LocationSelect {...baseProps} required={true} />);
//     cy.get('input').should('have.attr', 'required');
//   });

//   it('clears location when input is cleared', () => {
//     cy.mount(<LocationSelect {...baseProps} />);
//     cy.get('input').type('Sydney');
//     cy.get('input').clear();
//     cy.get('@setSelectedLocation').should('have.been.called');
//   });
// });