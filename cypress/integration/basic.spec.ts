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

  it('should validate autofill', () => {
    // React overrides `input.value` setters, so we have to call
    // native input setter
    // See: https://stackoverflow.com/a/46012210/1709679
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )?.set;

    function setInputValue(input: HTMLElement, value: string) {
      nativeInputValueSetter?.call(input, value);
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
    }

    cy.visit('http://localhost:3000/sign-in');

    cy.get('body').then($body => {
      // We have set value through JS to simulate autofill behavior.
      setInputValue($body.find('input[name="username"]')[0], '123');
      setInputValue($body.find('input[name="password"]')[0], '123');
    });

    cy.get('button').should('not.be.disabled');
  });
});
