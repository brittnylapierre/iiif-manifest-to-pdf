'use strict';

module.exports = createHash;

function createHash(length) {
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var text = '';

  length = length || 6;

  for (var i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return text;
}
