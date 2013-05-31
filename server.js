var http = require('http'),
    url = require('url'),
    search = require('./search'),
    requests = require('./requests');

var querystring = require('querystring');

function get_formatted_stream(query, response) {
  var rtype = parseInt(querystring.parse(query).rtype);

  switch (rtype) {
    case 4:
    case 5:
    case 6:
      console.log('search');
      return search.create_formatted_stream(response);
    default:
      console.log('default');
      return response;
  }
}

function start(config) {
  function onRequest(request_in, response_out){
    var query = url.parse(request_in.url).query;

    var request = http.request({
      host: config.remote_host, 
      path: '/index.aspx?' + query
    }, function (response) {
      console.log('response received');
      response_out.writeHead(response.statusCode,{"Content-Type": "application/json"});
      get_formatted_stream(query, response).pipe(response_out);
    });

    request.on('error', function(response) {
      console.log(response);
    });

    request.end();
 
  }

  http.createServer(onRequest).listen(config.port);
}

function start2(config) {
  function onRequest(request_in, response_out){
    var query = url.parse(request_in.url).query;

    var request = http.request({
      host: config.remote_host, 
      path: '/Service.svc',
      method: 'POST',
      headers: {'Content-Type': 'text/xml','SoapAction': 'com.thelateroomsgroup.services.search/ISearchService/SearchByText'}
    }, function (response) {
      console.log('response received');
      response_out.writeHead(response.statusCode,{"Content-Type": "application/json"});
      get_formatted_stream(query, response).pipe(response_out);
    });

    request.on('error', function(response) {
      console.log(response);
    });

    request.write(requests.createRequest(querystring.parse(query)));

    request.end();
 
  }

  http.createServer(onRequest).listen(config.port);
}


exports.start = start2;

