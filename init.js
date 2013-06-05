var server = require('./rest-server');

server.start(
  {
    port: 8080,
    remote_host: "v1.4.searchservice.qa.ad.laterooms.com" 
  }
);
