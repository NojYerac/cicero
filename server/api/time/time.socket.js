/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Time = require('./time.model');

exports.register = function(socket) {
  Time.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Time.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('time:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('time:remove', doc);
}