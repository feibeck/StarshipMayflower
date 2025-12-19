describe('compass: Compass component', () => {
  beforeEach(() => cy.visit('/iframe.html?id=compass--primary'));

  it('should render the component', () => {
    cy.get('h1').should('contain', 'Welcome to Compass!');
  });
});
