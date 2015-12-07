# Gabia SMS

Unofficial [Gabia SMS](http://sms.gabia.com/) API for Node.js.

## API

### Initialize library

```
var GabiaSms = require("gabia-sms");
var SMS = new GabiaSms(GABIA_ID, GABIA_API_KEY);
```

### Get SMS quota

`GabiaSms.getSmsCount(cb)`

### Send SMS(es), or LMS(es)

`GabiaSms.sendSms(params, cb)`, `GabiaSms.sendLms(params, cb)`, `GabiaSms.sendSmses(params, cb)`, `GabiaSms.sendLmses(params, cb)`

Object `params` should have three properties, `phone`, `callback`, `message`.

* `params.phone` - Destination phone number(s). Dashes in phone number(s) doesn't matter. If calling `sendSmses` or `sendLmses`, it can be comma seperated numbers, or `Array` of phone numbers.
* `params.callback` - Sending phone number. This phone number should be registered at Gabia SMS service. Dashes in phone number(s) doesn't matter.
* `params.message` - Body of SMS or LMS.

## TODO

* Better error handling
* Remove XMLRPC
* Implement all api
