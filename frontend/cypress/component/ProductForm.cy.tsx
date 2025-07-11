import React from 'react';
import ProductForm from '../../src/components/ProductForm';
import { Item } from '@/types/item';
import { Option } from '@/types/option';

// Mock Next.js router
const mockPush = cy.stub();
const mockRouter = {
  push: mockPush,
  pathname: '/',
  query: {},
  asPath: '/',
};

// Mock Next.js navigation
before(() => {
  cy.stub(require('next/navigation'), 'useRouter').returns(mockRouter);
});

// Mock item data for edit mode testing
const mockItem: Item = {
  id: 1,
  title: 'Existing Product',
  description: 'This is an existing product description',
  condition: 'Used',
  category: 'electronics',
  type: 'Gift',
  status: 'available',
  location: 'Sydney, NSW, Australia',
  images: ['/existing-image-1.jpg', '/existing-image-2.jpg'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  view_count: 0,
  approximate_location: 'Sydney, Australia',
  created_by: 1,
};

beforeEach(() => {
  document.body.classList.add('light');
  
  // Mock the API endpoints
  cy.intercept('POST', '**/api/item/create', {
    statusCode: 200,
    body: { message: 'Product created successfully', id: 123 },
  }).as('createItem');

  cy.intercept('PUT', '**/api/item/edit', {
    statusCode: 200,
    body: { message: 'Product updated successfully' },
  }).as('editItem');

  cy.intercept('GET', '**/api/autocomplete_address?*', {
    statusCode: 200,
    body: {
      predictions: [
        { place_id: 'place1', description: 'Sydney, NSW, Australia' },
        { place_id: 'place2', description: 'Melbourne, VIC, Australia' },
      ],
    },
  }).as('autocompleteAddress');

  // Mock authentication check
  cy.window().then((win) => {
    win.localStorage.setItem('authToken', 'mock-token');
  });
});

describe('<ProductForm /> - Create Mode', () => {
  it('renders all form fields with correct labels and placeholders', () => {
    cy.mount(<ProductForm />);
    
    // Check title
    cy.contains('Add New Product').should('exist');
    
    // Check form fields
    cy.contains('legend', 'Product Title').should('exist');
    cy.get('input[placeholder="Enter product name"]').should('exist');
    
    cy.contains('legend', 'Product Description').should('exist');
    cy.get('input[placeholder="Enter product description"]').should('exist');
    
    cy.contains('label', 'Location').should('exist');
    cy.contains('label', 'Condition').should('exist');
    cy.contains('label', 'Item Exchange Type').should('exist');
    cy.contains('legend', 'Product Images').should('exist');
  });

  it('validates required fields', () => {
    cy.mount(<ProductForm />);
    
    // Try to submit empty form
    cy.get('button[type="submit"]').click();
    
    // Should show validation message
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Please fill in all fields');
    });
  });

  it('allows filling all fields and submitting', () => {
    cy.mount(<ProductForm />);
    
    // Fill in title
    cy.get('input[placeholder="Enter product name"]').type('Test Product');
    
    // Fill in description
    cy.get('input[placeholder="Enter product description"]').type('This is a test product description');
    
    // Select location
    cy.get('input[placeholder="Search for a location..."]').type('Sydney');
    cy.wait('@autocompleteAddress');
    cy.contains('Sydney, NSW, Australia').click();
    
    // Select condition
    cy.contains('Select Condition').click();
    cy.contains('New').click();
    
    // Select type
    cy.contains('Select Item Exchange Type').click();
    cy.contains('Gift').click();
    
    // Upload image
    const fileName = 'test-image.jpg';
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('fake image content'),
      fileName: fileName,
      mimeType: 'image/jpeg',
    });
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Verify API call
    cy.wait('@createItem').then((interception) => {
      expect(interception.request.body).to.include({
        title: 'Test Product',
        description: 'This is a test product description',
        condition: 'new',
        type: 'Gift',
      });
    });
  });

  it('shows image preview when files are selected', () => {
    cy.mount(<ProductForm />);
    
    // Initially shows no images message
    cy.contains('No images selected').should('exist');
    
    // Upload multiple images
    cy.get('input[type="file"]').selectFile([
      {
        contents: Cypress.Buffer.from('fake image 1'),
        fileName: 'image1.jpg',
        mimeType: 'image/jpeg',
      },
      {
        contents: Cypress.Buffer.from('fake image 2'),
        fileName: 'image2.jpg',
        mimeType: 'image/jpeg',
      },
    ]);
    
    // Should show image previews
    cy.get('img[alt*="Uploaded image preview"]').should('have.length', 2);
    cy.contains('No images selected').should('not.exist');
  });
});

describe('<ProductForm /> - Edit Mode', () => {
  it('renders with existing item data', () => {
    cy.mount(<ProductForm item={mockItem} />);
    
    // Check title
    cy.contains('Edit Product').should('exist');
    
    // Check pre-filled values
    cy.get('input[placeholder="Existing Product"]').should('have.value', 'Existing Product');
    cy.get('input[placeholder="This is an existing product description"]').should('have.value', 'This is an existing product description');
    
    // Check existing images are displayed
    cy.get('img[alt*="Uploaded image preview"]').should('have.length', 2);
  });

  it('allows editing fields and submitting', () => {
    cy.mount(<ProductForm item={mockItem} />);
    
    // Edit title
    cy.get('input[value="Existing Product"]').clear().type('Updated Product');
    
    // Edit description
    cy.get('input[value="This is an existing product description"]').clear().type('Updated description');
    
    // Change condition
    cy.contains('Used').click();
    cy.contains('New').click();
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Verify API call
    cy.wait('@editItem').then((interception) => {
      expect(interception.request.body).to.include({
        id: 1,
        title: 'Updated Product',
        description: 'Updated description',
      });
    });
  });

  it('allows adding new images in edit mode', () => {
    cy.mount(<ProductForm item={mockItem} />);
    
    // Should show existing images
    cy.get('img[alt*="Uploaded image preview"]').should('have.length', 2);
    
    // Add new images
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('new image'),
      fileName: 'new-image.jpg',
      mimeType: 'image/jpeg',
    });
    
    // Should replace existing images with new ones
    cy.get('img[alt*="Uploaded image preview"]').should('have.length', 1);
  });
});

describe('<ProductForm /> - Authentication', () => {
  it('prompts login when not authenticated', () => {
    // Clear auth token
    cy.window().then((win) => {
      win.localStorage.removeItem('authToken');
    });
    
    cy.mount(<ProductForm />);
    
    // Fill minimal required fields
    cy.get('input[placeholder="Enter product name"]').type('Test');
    cy.get('input[placeholder="Enter product description"]').type('Test description');
    
    // Try to submit
    cy.get('button[type="submit"]').click();
    
    // Should show login prompt
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Please log in');
    });
  });
});