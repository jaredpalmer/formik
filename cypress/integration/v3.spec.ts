/// <reference types="cypress" />

describe('basic validation', () => {
  it('should validate before submit', () => {
    cy.visit('http://localhost:3000/v3');

    const masks = [
      { name: 'phone-1', type: 'old', parse: '999-999-9999' },
      { name: 'phone-2', type: 'new', parse: '(999) 999-9999' },
      { name: 'phone-3', type: 'new', parse: '+49 (AAAA) BBBBBB' },
    ];
    // Check that Formik can parse with Field
    cy.get('input[name="phone-1"]').type('9999999999');
    cy.get('input[name="phone-1"]').should('have.value', '999-999-9999');
    cy.get('input[name="phone-2"]').type('9999999999');
    cy.get('input[name="phone-2"]').should('have.value', '(999) 999-9999');
    cy.get('input[name="phone-3"]').type('+49AAAABBBBBB');
    cy.get('input[name="phone-3"]').should('have.value', '+49 (AAAA) BBBBBB');
    cy.get('span#render-phone-1').should('have.text', 35);
  });
});
