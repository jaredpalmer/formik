/// <reference types="cypress" />

describe('basic validation', () => {
  it('should validate before submit', () => {
    cy.visit('http://localhost:3000/basic');

    // Submit the form
    cy.get('button[type=submit]').click();

    // Check that all fields are touched and error messages work
    cy.get('input[name="firstName"] + p').contains('Required');
    cy.get('input[name="lastName"] + p').contains('Required');
    cy.get('input[name="email"] + p').contains('Required');

    cy.get('#renderCounter').contains('0');
  });
});
