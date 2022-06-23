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
        cy.get("main").findByText(`${username} joined the chat`).should("exist");

        cy.findByRole("textbox", { name: /message/i }).type("hello!~");
        cy.findByRole("button", { name: /send/i }).click();

        cy.findByRole("listitem", { name: /chat message #2/i }).should("contain.text", `${username}: hello!~`);

        cy.findByRole("list", { name: /chat user list/i }).should("not.exist");

        cy.findByRole("button", { name: /users/i }).click();
        cy.findByRole("list", { name: /chat user list/i }).should("have.text", username);

        cy.findByRole("button", { name: /users/i }).click();
        cy.findByRole("list", { name: /chat user list/i }).should("not.exist");
    });

    it("should allow you to join chat, control your input length, and exhibit intended scrolling behaviour", () => {
        const MAX_MESSAGE_LENGTH = 1869;
        const username = "differentname";

        cy.visit("/");
        cy.findByRole("link", { name: /chat/i }).click();

        cy.findByRole("textbox", { name: /username/i }).type(username);
        cy.findByRole("button", { name: /submit/i }).click();

        cy.wait(1000);
        cy.get("main").findByText(`${username} joined the chat`).should("exist");

        cy.findByRole("textbox", { name: /message/i }).type("W".repeat(MAX_MESSAGE_LENGTH - 100), { delay: 0 });
        cy.findByLabelText(/characters left until limit/i).should("not.exist");
        cy.findByRole("textbox", { name: /message/i }).type("W");
        cy.findByLabelText(/characters left until limit/i).should("have.text", 99);
        cy.findByRole("textbox", { name: /message/i }).type("W".repeat(99), { delay: 0 });
        cy.findByLabelText(/characters left until limit/i).should("have.text", 0);
        cy.findByRole("button", { name: /send/i }).click();

        cy.findByRole("listitem", { name: /chat message #2/i }).should("exist");

        cy.findByRole("list", { name: /chat messages/i })
            .invoke("scrollTop")
            .should("be.gt", 0);

        cy.findByRole("textbox", { name: /message/i }).type("W".repeat(MAX_MESSAGE_LENGTH + 1), { delay: 0 });
        cy.findByLabelText(/characters left until limit/i).should("have.text", -1);
        cy.findByRole("button", { name: /send/i }).click();

        cy.findByRole("listitem", { name: /chat message #3/i }).should("not.exist");

        cy.findByRole("textbox", { name: /message/i }).clear();

        cy.findByRole("listitem", { name: /chat message #1/i }).scrollIntoView();
        cy.findByRole("list", { name: /chat messages/i })
            .invoke("scrollTop")
            .then((prevScroll) => {
                cy.findByRole("textbox", { name: /message/i }).type("W");
                cy.findByRole("button", { name: /send/i }).click();
                cy.findByRole("list", { name: /chat messages/i })
                    .invoke("scrollTop")
                    .should("eq", prevScroll);
            });

        cy.findByRole("button", { name: /scroll to new messages/i }).click();
        cy.findByRole("list", { name: /chat messages/i })
            .invoke("scrollTop")
            .should("be.gt", 0);
    });
});
