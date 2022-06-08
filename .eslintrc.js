/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
    env: {
        browser: true,
        node: true,
        es2019: true,
        jest: true
    },
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "jsx-a11y"],
    extends: [
        "@remix-run/eslint-config",
        "@remix-run/eslint-config/node",
        "@remix-run/eslint-config/jest-testing-library",
        "eslint:recommended",
        "plugin:jsx-a11y/recommended",
        "prettier"
    ],
    parserOptions: {
        sourceType: "module",
        ecmaFeatures: {
            jsx: true
        }
    },
    overrides: [
        {
            files: ["**/*.ts", "**/*.tsx"],
            extends: [
                "plugin:@typescript-eslint/recommended",
                "plugin:@typescript-eslint/recommended-requiring-type-checking"
            ],
            parserOptions: {
                project: "./tsconfig.json"
            }
        }
    ],
    rules: {
        curly: ["error", "all"],
        "dot-notation": "error",
        eqeqeq: ["error", "smart"],
        "array-bracket-newline": ["error", { multiline: true }],
        "array-element-newline": ["error", "consistent"],
        "arrow-parens": ["error", "always"],
        "function-call-argument-newline": ["error", "consistent"],
        "max-len": "off",
        "object-curly-spacing": ["error", "always"],
        "object-property-newline": ["error", { allowAllPropertiesOnSameLine: true }],
        "padded-blocks": ["error", "never"],
        "space-infix-ops": "error"
    },
    // we're using vitest which has a very similar API to jest
    // (so the linting plugins work nicely), but it means we have to explicitly
    // set the jest version.
    settings: {
        jest: {
            version: 27
        }
    }
};
