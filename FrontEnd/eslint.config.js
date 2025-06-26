import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react";

export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...pluginReactConfig.configs.recommended,
  {
    rules: {
      "react/react-in-jsx-scope": "off", // Disable the React import requirement
      "no-undef": "off" // Disable no-undef since we're using globals
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    languageOptions: {
      globals: {
        ...globals.node, // This includes process
        ...globals.browser
      }
    }
  }
];