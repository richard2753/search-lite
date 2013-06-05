var restify = require('restify');
var formatter = require('./formatter');
var requests = require('./requests');
var url = require('url');
var http = require('http');
var querystring = require('querystring');

function start(config) {
  var server = restify.createServer();

  function search(method, request_in, response_out, next){
    var query = url.parse(request_in.url).query;

    var request = http.request({
      host: config.remote_host,
      path: '/Service.svc',
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'SoapAction': 'com.thelateroomsgroup.services.search/ISearchService/' + method
      }
    }, function (response) {
      console.log('response received');
      response_out.cache('public',{ maxAge: 600});
      response_out.writeHead(response.statusCode,{"Content-Type": "application/json"});
      formatter.create_formatted_stream(response).pipe(response_out);
    });

    request.on('error', function(response) {
      response_out.send(response);
      console.log(response);
    });

    request.write(requests.templates[method + '.xml'].createMessage(querystring.parse(query)));

    request.end();
  }

  var searchWith = function (requestType) {
    return function(req,res,next){return search(requestType,req,res,next);};
  }
  server.get('/hotel/list/by/text', searchWith('SearchByText'));
  server.get('/hotel/list/by/area', searchWith('SearchByArea'));
  server.get('/hotel/list/by/geocode', searchWith('SearchByGeoCode'));
  server.get('/hotel/list/by/geobound', searchWith('SearchByGeobound'));
  server.get('/hotel/list/by/keyword', searchWith('SearchByKeyword'));

  server.listen(config.port);
};

exports.start = start;
