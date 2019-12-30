const StaticServer = require('static-server');

const server = new StaticServer({
  rootPath: 'public',
  port: '1337',
  name: 'BHD Web Server 1.0'
});

server.start(() => {
  console.log(`Server listening to ${server.port}`);
});

server.on('request', (req, res) => {
  console.log(`[${req.elapsedTime}] ${req.path}`);
});
