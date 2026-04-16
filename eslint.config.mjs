import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "import/order": [
        "warn",
        {
          "newlines-between": "ignore",
          alphabetize: { order: "ignore", caseInsensitive: true },
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
        },
      ],
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/aria-role": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),
]);

export default eslintConfig;
