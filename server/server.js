

const loopback = require('loopback');
const boot = require('loopback-boot');

// eslint-disable-next-line no-multi-assign
const app = module.exports = loopback();

app.start = function () {
  app.use('/uploads', loopback.static('uploads'));
  // start the web server
  return app.listen(() => {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    // eslint-disable-next-line no-console
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      const explorerPath = app.get('loopback-component-explorer').mountPath;
      // eslint-disable-next-line no-console
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

const configDirPath = './server/config';
const bootOptions = {
  appConfigRootDir: configDirPath,
  modelsRootDir: configDirPath,
  dsRootDir: configDirPath,
  middlewareRootDir: configDirPath,
  componentRootDir: configDirPath,
  mixinDirs: [
    './server/mixins',
  ],
  bootDirs: [
    './server/boot',
  ],
};
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, bootOptions, (err) => {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) { app.start(); }
});
