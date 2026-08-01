describe('smoke', () => {
  it('shows the login page for an unauthenticated visitor', () => {
    cy.visit('/');
    cy.contains('Connect to your Subsonic server');
    cy.get('input[type="password"]').should('exist');
  });
});
