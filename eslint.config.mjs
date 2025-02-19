import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginQuery from "@tanstack/eslint-plugin-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...pluginQuery.configs["flat/recommended"],
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Allow 'any' type
      "@typescript-eslint/no-unused-vars": "off", // Turn off no-unused-vars rule
    },
  },
];

export default eslintConfig;