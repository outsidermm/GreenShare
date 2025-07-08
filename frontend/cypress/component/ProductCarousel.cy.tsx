import React from 'react';
import ProductCarousel from '../../src/components/ProductCarousel';

interface ProductCarouselProps {
  images: string[];
  title: string;
}

let baseProps: ProductCarouselProps;

beforeEach(() => {
  document.body.classList.add('light');
  
  baseProps = {
    images: [
      'https://via.placeholder.com/400x300/0000FF/FFFFFF?text=Image+1',
      'https://via.placeholder.com/400x300/FF0000/FFFFFF?text=Image+2',
      'https://via.placeholder.com/400x300/00FF00/FFFFFF?text=Image+3'
    ],
    title: 'Test Product'
  };
});

describe('<ProductCarousel />', () => {
  it('renders carousel with images', () => {
    cy.mount(<ProductCarousel {...baseProps} />);
    cy.get('.carousel').should('be.visible');
    cy.get('img').should('have.length', baseProps.images.length);
  });

  it('displays images with correct alt text', () => {
    cy.mount(<ProductCarousel {...baseProps} />);
    cy.get('img').each(($img, index) => {
      cy.wrap($img).should('have.attr', 'alt', `${baseProps.title} - Image ${index + 1}`);
    });
  });

  it('shows navigation controls when multiple images', () => {
    cy.mount(<ProductCarousel {...baseProps} />);
    cy.get('.carousel-prev').should('be.visible');
    cy.get('.carousel-next').should('be.visible');
  });

  it('navigates through images using controls', () => {
    cy.mount(<ProductCarousel {...baseProps} />);
    cy.get('.carousel-next').click();
    cy.get('.carousel-prev').click();
  });

  it('displays indicators for multiple images', () => {
    cy.mount(<ProductCarousel {...baseProps} />);
    cy.get('.carousel-indicators').should('be.visible');
    cy.get('.carousel-indicators button').should('have.length', baseProps.images.length);
  });

  it('handles single image without navigation', () => {
    const singleImageProps = {
      ...baseProps,
      images: ['https://via.placeholder.com/400x300/0000FF/FFFFFF?text=Single+Image']
    };
    cy.mount(<ProductCarousel {...singleImageProps} />);
    cy.get('img').should('have.length', 1);
  });

  it('handles empty images array', () => {
    const emptyProps = {
      ...baseProps,
      images: []
    };
    cy.mount(<ProductCarousel {...emptyProps} />);
    cy.get('.no-images').should('be.visible');
  });

  it('loads images properly', () => {
    cy.mount(<ProductCarousel {...baseProps} />);
    cy.get('img').first().should('have.attr', 'src').and('include', 'placeholder');
  });
});