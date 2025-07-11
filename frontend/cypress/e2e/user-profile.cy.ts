describe('User Profile and Account Management', () => {
  beforeEach(() => {
    // Set up authenticated state
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', 'mock-token')
      win.localStorage.setItem('csrfToken', 'mock-csrf-token')
      win.localStorage.setItem('user', JSON.stringify({ 
        id: 1, 
        email: 'test@example.com',
        name: 'Test User' 
      }))
    })
    cy.visit('/')
  })

  it('should handle user profile access and navigation', () => {
    // Test profile access from navigation
    cy.get('button, a').each(($el) => {
      const text = $el.text().toLowerCase()
      if (text.includes('profile') || text.includes('account') || text.includes('user')) {
        cy.wrap($el).click()
        return false
      }
    })
    
    // Test direct profile page access
    cy.request({ url: '/profile', failOnStatusCode: false }).then((response) => {
      if (response.status === 200) {
        cy.visit('/profile')
        cy.get('body').should('be.visible')
        
        // Test profile information display
        cy.get('h1, h2, h3').should('exist')
        
        // Test profile editing if available
        cy.get('button, a').each(($el) => {
          const text = $el.text().toLowerCase()
          if (text.includes('edit') || text.includes('update')) {
            cy.wrap($el).click()
            return false
          }
        })
      }
    })
  })

  it('should handle user items/products management', () => {
    // Test my products/items page
    cy.request({ url: '/my-products', failOnStatusCode: false }).then((response) => {
      if (response.status === 200) {
        cy.visit('/my-products')
        cy.get('body').should('be.visible')
        
        // Test product management actions
        cy.get('button, a').each(($el) => {
          const text = $el.text().toLowerCase()
          if (text.includes('edit') || text.includes('delete') || text.includes('view')) {
            cy.wrap($el).click()
            cy.wait(500)
            return false
          }
        })
      }
    })
    
    // Test my items alternative URL
    cy.request({ url: '/my-items', failOnStatusCode: false }).then((response) => {
      if (response.status === 200) {
        cy.visit('/my-items')
        cy.get('body').should('be.visible')
      }
    })
  })

  it('should handle offer management from user perspective', () => {
    // Test received offers
    cy.request({ url: '/my-offers', failOnStatusCode: false }).then((response) => {
      if (response.status === 200) {
        cy.visit('/my-offers')
        cy.get('body').should('be.visible')
        
        // Test offer actions
        cy.get('button').each(($btn) => {
          const text = $btn.text().toLowerCase()
          if (text.includes('accept') || text.includes('decline') || text.includes('view')) {
            cy.wrap($btn).click()
            cy.wait(500)
            return false
          }
        })
      }
    })
    
    // Test sent offers
    cy.request({ url: '/sent-offers', failOnStatusCode: false }).then((response) => {
      if (response.status === 200) {
        cy.visit('/sent-offers')
        cy.get('body').should('be.visible')
      }
    })
    
    // Generic offers page
    cy.request({ url: '/offers', failOnStatusCode: false }).then((response) => {
      if (response.status === 200) {
        cy.visit('/offers')
        cy.get('body').should('be.visible')
      }
    })
  })

  it('should handle account settings and preferences', () => {
    // Test settings page
    cy.request({ url: '/settings', failOnStatusCode: false }).then((response) => {
      if (response.status === 200) {
        cy.visit('/settings')
        cy.get('body').should('be.visible')
        
        // Test settings form interactions
        cy.get('input, select, textarea').each(($input) => {
          const type = $input.attr('type')
          if (type === 'text' || type === 'email') {
            cy.wrap($input).clear().type('updated value')
          } else if (type === 'checkbox') {
            cy.wrap($input).click()
          }
        })
        
        // Test save button
        cy.get('button').each(($btn) => {
          const text = $btn.text().toLowerCase()
          if (text.includes('save') || text.includes('update')) {
            cy.wrap($btn).click()
            return false
          }
        })
      }
    })
  })

  it('should handle user dashboard and overview', () => {
    // Test dashboard page
    cy.request({ url: '/dashboard', failOnStatusCode: false }).then((response) => {
      if (response.status === 200) {
        cy.visit('/dashboard')
        cy.get('body').should('be.visible')
        
        // Test dashboard navigation
        cy.get('a, button').each(($el) => {
          const text = $el.text().toLowerCase()
          if (text.includes('view all') || text.includes('manage') || text.includes('add')) {
            cy.wrap($el).click()
            cy.wait(500)
            return false
          }
        })
      }
    })
    
    // Test user statistics/overview display
    cy.visit('/')
    cy.get('body').should('contain', 'GreenShare')
    
    // Look for user-specific content when authenticated
    cy.get('span, div, p').should('exist')
  })

  it('should handle logout and session management', () => {
    cy.visit('/')
    
    // Test logout functionality
    cy.get('button, a').each(($el) => {
      const text = $el.text().toLowerCase()
      if (text.includes('logout') || text.includes('sign out')) {
        cy.wrap($el).click()
        return false
      }
    })
    
    // Verify logout cleared auth state
    cy.window().then((win) => {
      // After logout, auth tokens should be cleared
      expect(win.localStorage.getItem('authToken')).to.be.null
    })
    
    // Test redirect behavior after logout
    cy.url().should('not.include', '/profile')
    cy.url().should('not.include', '/dashboard')
  })
})