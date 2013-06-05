var fs = require('fs');

var Template = function (templateString) {
  var template = templateString;
  var regex = /\{\{.+\}\}/g;
  var fields = [];
  
  var Field = function(fieldToken) {
    var token = fieldToken;
    var tag = token.replace('{{','').replace('}}','').split(':');
    var name = tag[0];
    var defaultValue = tag.length == 1 ? '' : tag[1];
    var getDefaultValue = defaultValue ==='$TODAY$'
	? function () { return new Date().toISOString(); }
        : function () { return defaultValue; };

    this.populate = function (message, params) {
      return message.replace(token, params[name] || getDefaultValue());
    }
  }

  while (result = regex.exec(templateString)) {
    fields.push(new Field(result[0]));
  }

  this.createMessage = function (params) {
    var message;
    for (var i = 0; i < fields.length; i++) {
      message = fields[i].populate(message || template, params);
    } 
    return message || template;
  }
}

var templates = {};
var files = fs.readdirSync('./requests/').forEach(function(filename) {
  templates[filename] = new Template(fs.readFileSync('./requests/' + filename, {encoding: 'UTF-8'}));
});
console.log(templates);
exports.templates = templates;
