"use strict";

var xmlrpc = require("xmlrpc");
var _ = require("underscore");

var utils = require("./utils");

var GabiaSms = function(id, apiKey) {
  if(!id || id === "") throw "Parameter missing (id)";
  if(!apiKey || apiKey === "") throw "Parameter missing (apiKey)";

  this.id = id;
  this.apiKey = apiKey;

  this.nonce = utils.getNonce();
  this.accessToken = this.nonce + utils.md5(this.nonce + this.apiKey);

  this.xmlrpc = xmlrpc.createClient({
    host: "sms.gabia.com",
    post: 80,
    path: "/api"
  });
};

var parseXmlResult = function(body) {
  var resultXml = utils.xml2json(body);
  var dataXml = utils.xml2json(utils.b64decode(resultXml.response.result));

  return {
    code: resultXml.response.code,
    message: resultXml.response.mesg,
    data: dataXml,
  };
};

GabiaSms.prototype._requestXml = function(method, params, cb) {
  params = utils.json2xml(params);

  var xml = [
    "<request>",
      "<sms-id>" + this.id + "</sms-id>",
      "<access-token>" + this.accessToken + "</access-token>",
      "<response-format>xml</response-format>",
      "<method>" + method + "</method>",
      "<params>" + params + "</params>",
    "</request>"
  ].join("");

  this.xmlrpc.methodCall("gabiasms", [ xml ], (err, body) => {
    cb(err, parseXmlResult(body));
  });
};

/**
 * Get SMS quota
 * @param  {Function}  cb  Callback function with single Number argument
 */
GabiaSms.prototype.getSmsCount = function(cb) {
  this._requestXml("SMS.getUserInfo", {}, function(err, result) {
    if(cb) cb(err, {
      code: result.code,
      message: result.message,
      result: parseInt(result.data.root.sms_quantity, 10)
    });
  });
};

GabiaSms.prototype.getCallbackNum = function(cb) {
  this._requestXml("SMS.getCallbackNum", {}, function(err, result) {
    if(cb) cb(err, {
      code: result.code,
      message: result.message,
      result: {
        data: result.data
      }
    });
  });
};

/**
 * Send single SMS
 * @param  {Object}    params  params.phone = Destination phone number
 *                             params.callback = Phone number which is registered to Gabia
 *                             params.message = SMS content
 * @param  {Function}  cb      Callback function with informations
 */
GabiaSms.prototype.sendSms = function(params, cb) {
  this._send("SMS.send", "sms", params, cb);
};

/**
 * Send single LMS(MMS)
 * @param  {Object}    params  params.phone = Destination phone number
 *                             params.callback = Phone number which is registered to Gabia
 *                             params.subject = LMS title
 *                             params.message = LMS content
 * @param  {Function}  cb      Callback function with informations
 */
GabiaSms.prototype.sendLms = function(params, cb) {
  this._send("SMS.send", "lms", params, cb);
};

/**
 * Send multiple SMSes
 * @param  {Object}    params  params.phone = Comma seperated phone numbers, or array of phone numbers
 *                             params.callback = Phone number which is registered to Gabia
 *                             params.message = SMS content
 * @param  {Function}  cb      Callback function with informations
 */
GabiaSms.prototype.sendSmses = function(params, cb) {
  if(Array.isArray(params.phone)) params.phone = params.phone.join(",");
  this._send("SMS.multi_send", "sms", params, cb);
};

/**
 * Send multiple LMS(MMS)es
 * @param  {Object}    params  params.phone = Comma seperated phone numbers, or array of phone numbers
 *                             params.callback = Phone number which is registered to Gabia
 *                             params.subject = LMS title
 *                             params.message = LMS content
 * @param  {Function}  cb      Callback function with informations
 */
GabiaSms.prototype.sendLmses = function(params, cb) {
  if(Array.isArray(params.phone)) params.phone = params.phone.join(",");
  this._send("SMS.multi_send", "lms", params, cb);
};

GabiaSms.prototype._send = function(method, type, _params, cb) {
  if(!_params.phone || _params.phone === "")
    throw "Parameter missing (params.phone)";

  if(!_params.callback || _params.callback === "")
    throw "Parameter missing (params.callback)";

  if(!_params.message || _params.message === "")
    throw "Parameter missing (params.message)";

  var params = {
    ref_key: "",
    reserve: "0"
  };

  _.extend(params, _params);

  params.send_type = type;

  if(type === "sms") params.subject = "";

  this._requestXml(method, params, function(err, result) {
    if(cb) cb(err, {
      code: result.code,
      message: result.message,
      result: {
        countBefore: result.data.root.BEFORE_SMS_QTY,
        countAfter: result.data.root.AFTER_SMS_QTY,
      }
    });
  });
};

module.exports = GabiaSms;
