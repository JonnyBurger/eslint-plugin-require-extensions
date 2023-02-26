const { existsSync } = require("fs");
const { dirname, resolve } = require("path");

module.exports = {
  configs: {
    recommended: {
      plugins: ["validate-esm"],
      rules: {
        "validate-esm/require-extensions": "error",
      },
    },
  },
  rules: {
    "require-extensions": {
      meta: {
        fixable: true,
      },
      create(context) {
        function rule(node) {
          const source = node.source;
          if (!source) return;
          const value = source.value;
          if (!value || !value.startsWith(".") || value.endsWith(".js")) return;

          const filePath = resolve(dirname(context.getFilename()), value);
          if (!existsSync(filePath)) {
            context.report({
              node,
              message: "Relative imports and exports must end with .js",
              fix(fixer) {
                return fixer.replaceText(source, `'${value}.js'`);
              },
            });
            return;
          }
          if (lstatSync(filePath).isDirectory()) {
            context.report({
              node,
              message: "Don't import a directory, add /index.js",
              fix(fixer) {
                return fixer.replaceText(source, `'${value}/index.js'`);
              },
            });
          }
        }

        return {
          DeclareExportDeclaration: rule,
          DeclareExportAllDeclaration: rule,
          ExportAllDeclaration: rule,
          ExportNamedDeclaration: rule,
          ImportDeclaration: rule,
        };
      },
    },
  },
};
