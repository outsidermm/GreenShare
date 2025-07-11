import React from 'react';
import ProductCarousel from '../../src/components/ProductCarousel';
import { Item } from '@/types/item';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

// Mock item data for testing
const mockItemSingleImage: Item = {
  id: 1,
  title: 'Test Product',
  images: ['/test-image-1.jpg'],
  description: 'Test description',
  condition: 'new',
  category: 'electronics',
  type: 'home',
  status: 'available',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  view_count: 0,
  approximate_location: 'Sydney, Australia',
  created_by: 1,
};

const mockItemMultipleImages: Item = {
  ...mockItemSingleImage,
  images: [
    '/test-image-1.jpg',
    '/test-image-2.jpg',
    '/test-image-3.jpg',
    '/test-image-4.jpg',
  ],
};

beforeEach(() => {
  document.body.classList.add('light');
});

describe('<ProductCarousel />', () => {
  it('renders single image without navigation controls', () => {
    cy.mount(
      <ProductCarousel item={mockItemSingleImage} aspectRatio="4/3" />
    );
    
    // Should show the single image
    cy.get('img').should('have.length', 1);
    cy.get('img').should('have.attr', 'alt', 'Test Product');
    
    // Should not show navigation arrows or indicators
    cy.get('button[title*="previous"]').should('not.exist');
    cy.get('button[title*="next"]').should('not.exist');
    cy.get('li[role="button"]').should('not.exist');
  });

  it('renders multiple images with navigation controls', () => {
    cy.mount(
      <ProductCarousel item={mockItemMultipleImages} aspectRatio="4/3" />
    );
    
    // Should show the first image initially
    cy.get('.selected img').should('have.attr', 'src').and('include', 'test-image-1.jpg');
    
    // Should show navigation arrows
    cy.get('button').contains('svg').parent().should('have.length', 2);
    
    // Should show indicators for all images
    cy.get('li[role="button"]').should('have.length', 4);
    cy.get('li[role="button"]').first().should('have.class', 'bg-main-primary');
  });

  it('navigates between images using arrow buttons', () => {
    cy.mount(
      <ProductCarousel item={mockItemMultipleImages} aspectRatio="4/3" />
    );
    
    // Click next arrow
    cy.get('button').last().click();
    cy.get('.selected img').should('have.attr', 'src').and('include', 'test-image-2.jpg');
    
    // Click next arrow again
    cy.get('button').last().click();
    cy.get('.selected img').should('have.attr', 'src').and('include', 'test-image-3.jpg');
    
    // Click previous arrow
    cy.get('button').first().click();
    cy.get('.selected img').should('have.attr', 'src').and('include', 'test-image-2.jpg');
  });

  it('navigates between images using indicators', () => {
    cy.mount(
      <ProductCarousel item={mockItemMultipleImages} aspectRatio="4/3" />
    );
    
    // Click third indicator
    cy.get('li[role="button"]').eq(2).click();
    cy.get('.selected img').should('have.attr', 'src').and('include', 'test-image-3.jpg');
    cy.get('li[role="button"]').eq(2).should('have.class', 'bg-main-primary');
    
    // Click first indicator
    cy.get('li[role="button"]').first().click();
    cy.get('.selected img').should('have.attr', 'src').and('include', 'test-image-1.jpg');
    cy.get('li[role="button"]').first().should('have.class', 'bg-main-primary');
  });

  it('loops infinitely through images', () => {
    cy.mount(
      <ProductCarousel item={mockItemMultipleImages} aspectRatio="4/3" />
    );
    
    // Navigate to last image
    cy.get('li[role="button"]').last().click();
    cy.get('.selected img').should('have.attr', 'src').and('include', 'test-image-4.jpg');
    
    // Click next arrow to loop back to first image
    cy.get('button').last().click();
    cy.get('.selected img').should('have.attr', 'src').and('include', 'test-image-1.jpg');
    
    // Click previous arrow to loop to last image
    cy.get('button').first().click();
    cy.get('.selected img').should('have.attr', 'src').and('include', 'test-image-4.jpg');
  });

  it('applies correct aspect ratio', () => {
    cy.mount(
      <ProductCarousel item={mockItemSingleImage} aspectRatio="16/9" />
    );
    
    cy.get('.carousel-slider').within(() => {
      cy.get('div').first().should('have.class', 'aspect-[16/9]');
    });
  });

  it('has proper accessibility attributes', () => {
    cy.mount(
      <ProductCarousel item={mockItemMultipleImages} aspectRatio="4/3" />
    );
    
    // Check indicators have proper aria-labels
    cy.get('li[role="button"]').each(($el, index) => {
      cy.wrap($el).should('have.attr', 'aria-label', `Slide ${index + 1}`);
    });
    
    // Check navigation buttons have titles
    cy.get('button').first().should('have.attr', 'title');
    cy.get('button').last().should('have.attr', 'title');
  });
});