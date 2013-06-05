var server = require('./rest-server');

server.start(
  {
    port: 9000,
    remote_host: "v1.4.search.services.thelateroomsgroup.com" 
  }
);
