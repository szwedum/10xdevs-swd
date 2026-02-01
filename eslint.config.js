import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import eslintPluginAstro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

const baseConfig = tseslint.config({
  extends: [eslint.configs.recommended, tseslint.configs.strict, tseslint.configs.stylistic],
  rules: {
    "no-console": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/no-useless-constructor": "off",
    "@typescript-eslint/no-extraneous-class": "off",
  },
});

const jsxA11yConfig = tseslint.config({
  files: ["**/*.{js,jsx,ts,tsx}"],
  extends: [jsxA11y.flatConfigs.recommended],
  languageOptions: {
    ...jsxA11y.flatConfigs.recommended.languageOptions,
  },
  rules: {
    ...jsxA11y.flatConfigs.recommended.rules,
    "jsx-a11y/no-autofocus": "warn",
    "jsx-a11y/no-redundant-roles": "warn",
  },
});

const reactConfig = tseslint.config({
  files: ["**/*.{js,jsx,ts,tsx}"],
  extends: [pluginReact.configs.flat.recommended],
  languageOptions: {
    ...pluginReact.configs.flat.recommended.languageOptions,
    globals: {
      window: true,
      document: true,
    },
  },
  plugins: {
    "react-hooks": eslintPluginReactHooks,
    "react-compiler": reactCompiler,
  },
  settings: { react: { version: "detect" } },
  rules: {
    ...eslintPluginReactHooks.configs.recommended.rules,
    "react/react-in-jsx-scope": "off",
    "react-compiler/react-compiler": "error",
    "react/no-unescaped-entities": "warn",
    "react/no-unknown-property": "warn",
  },
});

const testConfig = tseslint.config({
  files: ["tests/**/*.ts", "**/*.test.ts", "**/*.spec.ts", "**/*.test.tsx", "**/*.spec.tsx"],
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-unsafe-function-type": "off",
    "no-console": "off",
  },
});

const configFilesConfig = tseslint.config({
  files: ["*.config.js", "*.config.ts", "*.config.mjs", "tailwind.config.js"],
  languageOptions: {
    globals: {
      module: true,
      require: true,
      process: true,
    },
  },
  rules: {
    "@typescript-eslint/no-require-imports": "off",
    "no-undef": "off",
  },
});

const astroOverrides = {
  files: ["**/*.astro"],
  rules: {
    "prettier/prettier": "off",
    "no-console": "off",
  },
};

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  {
    ignores: ["src/components/navigation/NavigationHeader.astro"],
  },
  baseConfig,
  jsxA11yConfig,
  reactConfig,
  testConfig,
  configFilesConfig,
  eslintPluginAstro.configs["flat/recommended"],
  eslintPluginPrettier,
  astroOverrides
);
