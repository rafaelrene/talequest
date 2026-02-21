describe("foundation flows", () => {
  it("shows auth entry points for signed-out users", () => {
    cy.visit("/");

    cy.contains("button", "Sign in").should("be.visible");
    cy.contains("button", "Sign up").should("be.visible");
  });

  it("keeps dark mode across reload", () => {
    cy.visit("/");
    cy.contains("button", "Dark").click();
    cy.get("html").should("have.attr", "data-theme", "dark");

    cy.reload();
    cy.get("html").should("have.attr", "data-theme", "dark");
  });

  it("supports library navigation", () => {
    cy.visit("/library");
    cy.contains("h1", "Library").should("be.visible");
    cy.get('a[href^="/library/"]').first().click();
    cy.contains("a", "Back to library").should("be.visible");
  });

  it("allows anonymous comment submission", () => {
    cy.request("/api/stories").then((response) => {
      const slug = response.body?.stories?.[0]?.slug;
      expect(slug).to.be.a("string");

      cy.visit(`/library/${slug as string}`);
      cy.get("#guest-name").type("Guest Reader");
      cy.get("#comment-body").type("Great story.");
      cy.contains("button", "Post comment").click();
      cy.contains("Posted.").should("be.visible");
    });
  });
});
