var util = require('util'),
    events = require('events'),
    stream = require('stream'),
    expat = require('node-expat');

var Hotel = function() {
};

var HotelList2 = function (parser) {

  events.EventEmitter.call(this);
  
  var self = this,
      currentHotel;

  parser.on('startElement', function (el) {
    if (el === 'hotel') {
      currentHotel = new Hotel();
      var end_handler =  function(el) {
        if (el === 'hotel') {
          self.emit('hotel', {id: currentHotel.id, price: currentHotel.price});
          parser.removeListener('endElement', end_handler);
        }
      }
      parser.on('endElement', end_handler);
    }

    if (el === 'hotel_ref') {
      var id_handler = function (text) {
        currentHotel.id = text;
        parser.removeListener('text', id_handler);
      };
      parser.on('text', id_handler);
    }

    if (el === 'price') {
      var price_handler = function (text) {
        currentHotel.price = parseFloat(text);
        parser.removeListener('text', price_handler);
      };
      parser.on('text', price_handler);
    }
  });

  parser.on('close', function() {
    self.emit('close');    
  });
};


var HotelList = function (parser) {

  events.EventEmitter.call(this);
  
  var self = this,
      currentHotel;

  parser.on('startElement', function (el) {
    if (el === 'HotelSearchResult') {
      currentHotel = new Hotel();
      currentHotel.price = 0.00;
      var end_handler =  function(el) {
        if (el === 'HotelSearchResult') {
          self.emit('hotel', {id: currentHotel.id, price: Math.round(currentHotel.price*100)/100});
          parser.removeListener('endElement', end_handler);
        }
      }
      parser.on('endElement', end_handler);
    }

    if (el === 'Id') {
      if (!currentHotel) return;
      var id_handler = function (text) {
        currentHotel.id = text;
      };
      parser.once('text', id_handler);
    }

    if (el === 'BestPrice') {
      var price_handler = function (text) {
        currentHotel.price += parseFloat(text);
      };
      parser.once('text', price_handler);
    }
  });

  parser.on('close', function() {
    self.emit('close');    
  });
};

util.inherits(HotelList, events.EventEmitter);

var Formatter = function(parser) {
  var self = this;
  var hotel_list = new HotelList(parser);
  stream.Readable.call(self);

  var prefix = '[';
  hotel_list.on('hotel', function (hotel) {
    self.push(prefix + JSON.stringify(hotel));
    prefix = ',';
  });

  hotel_list.on('close', function () {
    self.push(']');
    self.emit('end');
  });
}
util.inherits(Formatter, stream.Readable);
Formatter.prototype._read = function (size) {
};

var create_formatted_stream = function (stream) {
  var parser = new expat.Parser("UTF-8");
  var formatter = new Formatter(parser);
  stream.pipe(parser);
  return formatter;
}

exports.create_formatted_stream = create_formatted_stream;

