module.exports = {
  extends: ["@monoscope/eslint-config/base"],
  parserOptions: {
    project: "./tsconfig.json",
  },
  ignorePatterns: [
    "node_modules",
    "dist",
    ".next",
    "coverage",
    "*.config.js",
    "*.config.ts"
  ]
}