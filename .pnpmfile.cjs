module.exports = {
  hooks: {
    readPackage(pkg, context) {
      // The submodule 'konnn-extension' has a 'wxt prepare' postinstall script 
      // that fails in our monorepo environment (unknown scheme in vite-node fetch).
      // We strip it during pnpm install so it doesn't break the workspace install.
      if (pkg.name === 'konnn-extension') {
        if (pkg.scripts && pkg.scripts.postinstall) {
          delete pkg.scripts.postinstall;
          context.log('Removed postinstall script from konnn-extension to prevent wxt prepare error');
        }
      }
      return pkg;
    }
  }
};
