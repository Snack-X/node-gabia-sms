"use strict";

var crypto = require("crypto");

var parser = require("xml2json");
var _ = require("underscore");

module.exports = {
  md5: function(str) {
    var h = crypto.createHash("md5");
    h.update(str);
    return h.digest("hex");
  },

  getNonce: function() {
    return crypto.randomBytes(4).toString("hex");
  },

  xml2json: function(xml) {
    return parser.toJson(xml, { object: true });
  },

  json2xml: function(json, raw) {
    if(!raw)
      json = _.mapObject(json, function(v) { return { $t: v } });

    return parser.toXml(json);
  },

  b64decode: function(b64, encoding) {
    encoding = encoding || "utf8";

    return new Buffer(b64, "base64").toString("utf8");
  },

};
