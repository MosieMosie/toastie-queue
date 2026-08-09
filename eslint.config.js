import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import {defineConfig} from "eslint/config";
import {createTypeScriptImportResolver} from "eslint-import-resolver-typescript";
import importPlugin from "eslint-plugin-import-x";
import react from "eslint-plugin-react";
import solid from "eslint-plugin-solid/configs/typescript";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    name: "toastie/ignores",
    ignores: ["dist/", "data/"],
  },
  {
    name: "toastie/options",
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.js"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      stylistic,
      import: {rules: importPlugin.rules},
      react,
    },
    settings: {
      "import-x/extensions": [".js", ".jsx", ".ts", ".tsx"],
      "import-x/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import-x/resolver-next": [createTypeScriptImportResolver()],
      "react": {version: "19"},
    },
  },

  {
    ...eslint.configs.recommended,
    name: "eslint/recommended",
  },
  ...[
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ].map((conf) => ({
    ...conf,
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
  })),
  {
    ...solid,
    name: "solid/recommended",
  },
  {
    name: "toastie/rules",
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    rules: {
      // ESLint - https://eslint.org/docs/latest/rules/
      "accessor-pairs": "error",
      "array-callback-return": "error",
      "arrow-body-style": ["error", "as-needed"],
      "block-scoped-var": "error",
      "curly": "error",
      "eqeqeq": "error",
      "func-style": ["error", "declaration", {allowArrowFunctions: true}],
      "grouped-accessor-pairs": "error",
      "guard-for-in": "error",
      "id-denylist": ["error", "_"],
      "max-depth": "error",
      "no-alert": "error",
      "no-caller": "error",
      "no-console": ["error", {allow: ["warn", "error"]}],
      "no-constructor-return": "error",
      "no-continue": "error",
      "no-else-return": "error",
      "no-extend-native": "error",
      "no-implicit-coercion": "error",
      "no-labels": "error",
      "no-lone-blocks": "error",
      "no-lonely-if": "error",
      "no-multi-assign": "error",
      "no-multi-str": "error",
      "no-new-wrappers": "error",
      "no-octal-escape": "error",
      "no-promise-executor-return": "error",
      "no-restricted-globals": [
        "error",
        {name: "isNaN", message: "Use Number.isNaN instead."},
      ],
      "no-return-assign": "error",
      "no-self-compare": "error",
      "no-sequences": ["error", {allowInParentheses: false}],
      "no-template-curly-in-string": "error",
      "no-undef-init": "error",
      "no-unneeded-ternary": "error",
      "no-unreachable-loop": "error",
      "no-useless-call": "error",
      "no-useless-computed-key": "error",
      "no-useless-concat": "error",
      "no-useless-rename": "error",
      "no-useless-return": "error",
      "no-void": "error",
      "no-warning-comments": "error",
      "object-shorthand": "error",
      "operator-assignment": "error",
      "prefer-arrow-callback": "error",
      "prefer-const": "off",
      "prefer-exponentiation-operator": "error",
      "prefer-numeric-literals": "error",
      "prefer-object-spread": "error",
      "prefer-regex-literals": "error",
      "prefer-template": "error",
      "radix": "error",
      "require-unicode-regexp": "error",
      "sort-imports": [
        "error",
        {ignoreDeclarationSort: true, ignoreCase: true},
      ],
      "strict": ["error", "never"],
      "yoda": "error",

      // ESLint Stylistic - https://eslint.style/rules
      "stylistic/lines-between-class-members": [
        "error",
        "always",
        {exceptAfterSingleLine: true},
      ],
      "stylistic/multiline-comment-style": ["error", "separate-lines"],
      "stylistic/quotes": ["error", "double", {avoidEscape: true}],
      "stylistic/spaced-comment": "error",

      // TypeScript - https://typescript-eslint.io/rules/
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {prefer: "no-type-imports"},
      ],
      "@typescript-eslint/default-param-last": "error",
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {accessibility: "no-public"},
      ],
      "@typescript-eslint/method-signature-style": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-extraneous-class": "error",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-inferrable-types": [
        "error",
        {
          ignoreParameters: true,
          ignoreProperties: true,
        },
      ],
      "@typescript-eslint/no-invalid-void-type": "error",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "solid-js/jsx-runtime",
              message: "Import JSX directly from 'solid-js' instead.",
            },
            {
              name: "solid-js/h/jsx-runtime",
              message: "Import JSX directly from 'solid-js' instead.",
            },
          ],
        },
      ],
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
      "@typescript-eslint/no-unnecessary-template-expression": "error",
      "@typescript-eslint/no-unnecessary-type-arguments": "error",
      "@typescript-eslint/no-unused-vars": ["error", {argsIgnorePattern: "^_"}],
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/no-useless-default-assignment": "error",
      "@typescript-eslint/parameter-properties": "error",
      "@typescript-eslint/prefer-literal-enum-member": "error",
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        {ignorePrimitives: {boolean: true}},
      ],
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/prefer-reduce-type-parameter": "error",
      "@typescript-eslint/require-array-sort-compare": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {allowNever: true},
      ],
      "@typescript-eslint/return-await": "error",
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          considerDefaultExhaustiveForUnions: true,
          requireDefaultForNonUnion: true,
        },
      ],
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/unified-signatures": "error",

      // Imports - https://github.com/un-ts/eslint-plugin-import-x#rules
      "import/no-absolute-path": "error",
      "import/no-useless-path-segments": "error",
      "import/export": "error",
      "import/first": "error",
      "import/no-duplicates": "error",
      "import/order": [
        "error",
        {
          "groups": [
            "builtin",
            "external",
            "internal",
            "parent",
            "index",
            "sibling",
          ],
          "newlines-between": "always",
          "alphabetize": {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // SolidJS - https://github.com/solidjs-community/eslint-plugin-solid#rules
      "solid/components-return-once": "error",
      "solid/event-handlers": "error",
      "solid/imports": "error",
      "solid/no-array-handlers": "error",
      "solid/no-react-deps": "error",
      "solid/no-react-specific-props": "error",
      "solid/reactivity": [
        "error",
        {customReactiveFunctions: ["draggable", "dropZone", "press"]},
      ],
      "solid/self-closing-comp": "error",
      "solid/style-prop": "error",

      // JSX (borrowed from React) - https://github.com/jsx-eslint/eslint-plugin-react#list-of-supported-rules
      "react/button-has-type": "error",
      "react/jsx-boolean-value": "error",
      "react/jsx-curly-brace-presence": "error",
      "react/jsx-filename-extension": [
        "error",
        {allow: "as-needed", extensions: [".tsx"]},
      ],
      "react/jsx-no-comment-textnodes": "error",
      "react/jsx-no-useless-fragment": "error",
      "react/no-children-prop": "error",
      "react/no-unused-prop-types": "error",
    },
  },

  // The server runs on plain Node with type stripping: `import type` is
  // required there (a stripped value-import of a type would break at runtime),
  // and console.log is the server's way of talking.
  {
    name: "toastie/server",
    files: ["server/**/*.ts", "shared/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {prefer: "type-imports", fixStyle: "inline-type-imports"},
      ],
      "no-console": "off",
    },
  },
);
