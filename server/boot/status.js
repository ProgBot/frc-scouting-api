const fs = require('fs');

module.exports = function status(server) {
  const router = server.loopback.Router();
  router.get('/lbstatus', server.loopback.status());
  // Only have the root url lead to the status page if we're not serving a client
  if (fs.existsSync('client')) {
    router.get('/lbstatus', server.loopback.status());
  }
  server.use(router);
};
