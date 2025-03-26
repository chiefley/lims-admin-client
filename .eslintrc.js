module.exports = {
  extends: ["react-app", "react-app/jest"],
  rules: {
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars": "warn",
    "react/jsx-curly-brace-presence": [
      "warn",
      { props: "never", children: "never" },
    ],
    "react/self-closing-comp": "warn",
  },
};
