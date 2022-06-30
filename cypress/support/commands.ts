// import faker from "@faker-js/faker";
export default "";

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Deletes the current @user
             *
             * @returns {typeof cleanupUser}
             * @memberof Chainable
             * @example
             *    cy.cleanupUser()
             * @example
             *    cy.cleanupUser({ email: 'whatever@example.com' })
             */
            cleanupUser: typeof cleanupUser;
        }
    }
}

function cleanupUser() {
    cy.clearCookie("__session");
}

Cypress.Commands.add("cleanupUser", cleanupUser);

/*
eslint
  @typescript-eslint/no-namespace: "off",
*/
