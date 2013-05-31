var fs = require('fs');

var file = fs.readFileSync('./requests/SearchByText.xml', {encoding: 'UTF-8'});

//console.log(file);

var createRequest = function(params) {
  return file
    .replace('{{arrivalDate}}', params['arrivalDate'] || new Date().toISOString())
    .replace('{{currencyCode}}', params['currencyCode'] || 'GBP')
    .replace('{{nights}}', params['nights'] || 1)
    .replace('{{adults}}', params['adults'] || 2)
    .replace('{{children}}', params['children'] || 0)
    .replace('{{searchTerm}}', params['searchTerm']);
}
//console.log(createRequest({searchTerm: 'london'}));


exports.createRequest = createRequest;
