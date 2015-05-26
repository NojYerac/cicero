'use strict';

var exports = {};

exports.update = function(doc, specs) {
  var err = {message: 'Validation Error', errors: {}};
  specs.forEach( function(spec) {
    var test = doc[spec.name];
    //console.log(test);console.log(spec);
    if ( spec.required && test === undefined) {return;}
    else if ( spec.required && spec.type !== Boolean && (!test)) {
      err.errors[spec.name] = {message: 'Path `' + spec.name + '` is required.' };
    }
    if ( test !== spec.type(test) ) {
      err.errors[spec.name] = {message: 'Path `' + spec.name + '` must have type `' + (typeof spec.type()) + '`.' };
    }
  });
  if (Object.keys(err.errors).length > 0) {
    return err;
  }
};

module.exports = exports;
