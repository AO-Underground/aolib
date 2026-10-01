import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "schemas/**",
      "tmp/**",
      "eslint.config.js",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Library uses `Schema<any>` as a deliberate top type for the
      // dispatch maps; the alternative (`unknown`) breaks variance.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
      // Interfaces use method shorthand for codecs; switching to property
      // syntax breaks variance (`ScalarField<number>` no longer satisfies
      // `Field<unknown>`). Every codec in this codebase is a stateless
      // closure, so the unbound-method risk doesn't apply.
      "@typescript-eslint/unbound-method": "off",
    },
  },
  {
    files: ["exampleClient.ts", "exampleServer.ts", "tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
);
