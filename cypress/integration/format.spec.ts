/// <reference types="cypress" />

describe('format and parse', () => {
  it('parse strings', () => {
    cy.visit('http://localhost:3000/format');

    // Check that Formik can parse with Field
    cy.get('input[name="phone-1"]').type('9999999999');
    cy.get('input[name="phone-1"]').should('have.value', '999-999-9999');
    cy.get('input[name="phone-2"]').type('9999999999');
    cy.get('input[name="phone-2"]').should('have.value', '(999) 999-9999');
    cy.get('input[name="phone-3"]').type('+49AAAABBBBBB');
    cy.get('input[name="phone-3"]').should('have.value', '+49 (AAAA) BBBBBB');
  });
});
