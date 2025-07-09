// import React from 'react';
// import ProductForm from '../../src/components/ProductForm';

// interface ProductFormProps {
//   formData: any;
//   setFormData: (data: any) => void;
//   errors: any;
//   setErrors: (errors: any) => void;
//   onSubmit: (e: React.FormEvent) => void;
//   isEdit?: boolean;
// }

// let baseProps: ProductFormProps;
// let setFormData: any;
// let setErrors: any;
// let onSubmit: any;

// beforeEach(() => {
//   setFormData = cy.stub().as('setFormData');
//   setErrors = cy.stub().as('setErrors');
//   onSubmit = cy.stub().as('onSubmit');
//   document.body.classList.add('light');
  
//   baseProps = {
//     formData: {
//       title: '',
//       description: '',
//       condition: null,
//       type: null,
//       location: null,
//       images: []
//     },
//     setFormData,
//     errors: {},
//     setErrors,
//     onSubmit,
//     isEdit: false,
//   };
// });

// describe('<ProductForm />', () => {
//   it('renders all form fields', () => {
//     cy.mount(<ProductForm {...baseProps} />);
//     cy.get('input[name="title"]').should('be.visible');
//     cy.get('textarea[name="description"]').should('be.visible');
//     cy.get('button[type="submit"]').should('be.visible');
//   });

//   it('handles title input change', () => {
//     cy.mount(<ProductForm {...baseProps} />);
//     cy.get('input[name="title"]').type('Test Product');
//     cy.get('@setFormData').should('have.been.called');
//   });

//   it('handles description input change', () => {
//     cy.mount(<ProductForm {...baseProps} />);
//     cy.get('textarea[name="description"]').type('Test description');
//     cy.get('@setFormData').should('have.been.called');
//   });

//   it('displays validation errors', () => {
//     const propsWithErrors = {
//       ...baseProps,
//       errors: {
//         title: 'Title is required',
//         description: 'Description is required'
//       }
//     };
//     cy.mount(<ProductForm {...propsWithErrors} />);
//     cy.contains('Title is required').should('be.visible');
//     cy.contains('Description is required').should('be.visible');
//   });

//   it('calls onSubmit when form is submitted', () => {
//     cy.mount(<ProductForm {...baseProps} />);
//     cy.get('form').submit();
//     cy.get('@onSubmit').should('have.been.called');
//   });

//   it('shows different text for edit mode', () => {
//     const editProps = { ...baseProps, isEdit: true };
//     cy.mount(<ProductForm {...editProps} />);
//     cy.contains('Update').should('be.visible');
//   });

//   it('shows create text for new product', () => {
//     cy.mount(<ProductForm {...baseProps} />);
//     cy.contains('Create').should('be.visible');
//   });

//   it('handles image upload', () => {
//     cy.mount(<ProductForm {...baseProps} />);
//     cy.get('input[type="file"]').should('be.visible');
//   });

//   it('displays condition and type dropdowns', () => {
//     cy.mount(<ProductForm {...baseProps} />);
//     cy.contains('Condition:').should('be.visible');
//     cy.contains('Type:').should('be.visible');
//   });

//   it('displays location selector', () => {
//     cy.mount(<ProductForm {...baseProps} />);
//     cy.contains('Location:').should('be.visible');
//   });
// });