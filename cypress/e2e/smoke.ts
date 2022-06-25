describe("smoke tests", () => {
    afterEach(() => {
        cy.cleanupUser();
    });

    it("should allow you to join chat, chat, and view the user list when appropriate", () => {
        const username = "test name";

        cy.visit("/");
        cy.findByRole("link", { name: /chat/i }).click();

        cy.findByRole("textbox", { name: /username/i }).type(username);
        cy.findByRole("button", { name: /submit/i }).click();

        cy.wait(1000);
        cy.findByText(`${username} joined the chat`).should("exist");

        cy.findByPlaceholderText(/your message/i).type("hello!~");
        cy.findByRole("button", { name: /send/i }).click();

        cy.findByText(/hello!~/i).should("contain.text", `${username}: hello!~`);

        cy.findByText(`${username}`).should("not.exist");

        cy.findByRole("button", { name: /users/i }).click();
        cy.findByText(`${username}`).should("exist");

        cy.findByRole("button", { name: /users/i }).click();
        cy.findByText(`${username}`).should("not.exist");
    });

    it("should allow you to join chat, control your input length, and exhibit intended scrolling behaviour", () => {
        const MAX_MESSAGE_LENGTH = 1869;
        const username = "differentname";

        cy.visit("/");
        cy.findByRole("link", { name: /chat/i }).click();

        cy.findByRole("textbox", { name: /username/i }).type(username);
        cy.findByRole("button", { name: /submit/i }).click();

        cy.wait(1000);
        cy.findByText(`${username} joined the chat`).should("exist");

        cy.findByPlaceholderText(/your message/i).type("W".repeat(MAX_MESSAGE_LENGTH - 100), { delay: 0 });
        cy.findByText(100).should("not.exist");
        cy.findByPlaceholderText(/your message/i).type("W");
        cy.findByText(100 - 1).should("exist");
        cy.findByPlaceholderText(/your message/i).type("W".repeat(99), { delay: 0 });
        cy.findByText(0).should("exist");
        cy.findByRole("button", { name: /send/i }).click();

        cy.findByText(/WWWWWWWWWWWWWWW/).should("contain.text", `${username}: ${"W".repeat(MAX_MESSAGE_LENGTH)}`);

        cy.findByRole("list").invoke("scrollTop").should("be.gt", 0);

        cy.findByPlaceholderText(/your message/i).type("W".repeat(MAX_MESSAGE_LENGTH + 1), { delay: 0 });
        cy.findByText(-1).should("exist");
        cy.findByRole("button", { name: /send/i }).click();

        cy.findByText("W".repeat(MAX_MESSAGE_LENGTH + 1), { exact: false }).should("not.exist");

        cy.findByPlaceholderText(/your message/i).clear();

        cy.findByText(`${username} joined the chat`).scrollIntoView();
        cy.findByRole("list")
            .invoke("scrollTop")
            .then((prevScroll) => {
                cy.findByPlaceholderText(/your message/i).type("W");
                cy.findByRole("button", { name: /send/i }).click();
                cy.findByRole("list").invoke("scrollTop").should("eq", prevScroll);
            });

        cy.findByRole("button", { name: /scroll to new messages/i }).click();
        cy.findByRole("list").invoke("scrollTop").should("be.gt", 0);
    });
});
