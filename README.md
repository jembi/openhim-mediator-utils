# OpenHIM mediator utils

This package contains a few useful functions to make it easier to develop OpenHIM
mediators. When creating a node.js mediator you can make use of it by installing
it through NPM as follows:

```
$ npm install --save openhim-mediator-utils
```

You can then use the package as follows:

```js
const utils = require('openhim-mediator-utils');

utils.registerMediator(...);
utils.authenticate(...);
utils.genAuthHeaders(...);
utils.activateHeartbeat(...);
utils.deactivateHearbeat(...);
utils.fetchConfig(...);
```

## API details

### Mediator Registration

#### .registerMediator(options, mediatorConfig, callback)

Register this mediator with OpenHIM core using the supplied mediatorConfig. This
function takes an options object, the mediator config to register
this mediator with and a callback as parameters.

The options object has the following format:
* `options.apiURL` - the URL of the OpenHIM core API eg. "https://localhost:8080"
* `options.username` - the username of the user to be authenticate with
* `options.password` - the password for the user

`mediatorConfig` is an object that follows the mediatorConfig structure: http://openhim.readthedocs.org/en/latest/dev-guide/mediators.html#mediator-registration

The callback is called with an error object if an error occurs otherwise it is
called with nothing.

### OpenHIM API Authentication

#### .authenticate(options, callback)

Fetches authentication detail from the OpenHIM core to use for future
communication, options must contain:

* options.apiURL - the URL of the OpenHIM core API eg. "https://localhost:8080"
* options.username - the username of the user to be authenticated

callback will be called with an Error object if an error occurs, otherwise
the body received from the OpenHIM-core server is returned. This is an object
like the following `{salt: <userSalt>, ts: <timestampOfServer>}`.

#### .genAuthHeaders(options)

Generates authentication headers to make an authenticated API requests. This can
only be used after the `.authenticate()` function has been called for this
user. The username and password of the user must be passed to this function
as strings in the options object (eg. `{username: '<username>', password: '<password>'}`).

The authentication headers are returned as a headers object. eg.

```js
headers = {
 'auth-username': username,
 'auth-ts': ts,
 'auth-salt': salt,
 'auth-token': token
}
```

If the user has not been authenticated first, then an exception will be thrown

### Mediator Heartbeats and Configuration

#### .activateHeartbeat(options, interval)

Begins sending heartbeats to the OpenHIM-core server (also returns any config
changes). This function takes an options object with the following properties:

* `options.apiURL` - the URL of the OpenHIM core API eg. "https://localhost:8080"
* `options.username` - the username of the user to be authenticated
* `options.password` - the password for the user

It also takes an interval parameter which is the interval to send heartbeats
in ms. This parameter default to 10s.

This function returns an event emitter which emits a 'config' event with a
config object each time the mediator config is changed on the OpenHIM. If an
error occurs an 'error' event is emitted with an error object.

#### .deactivateHearbeat()

Deactivates the sending of heartbeats.

#### .fetchConfig(options, callback)

Forces the latest config to be returned from the OpenHIM-core. This is useful
when you need to fetch initial config at mediator startup (if you are just interested in the latest config updates use rather `.activateHeartbeat(...)` above). This function takes
an options object with the following properties:

* `options.apiURL` - the URL of the OpenHIM core API eg. "https://localhost:8080"
* `options.username` - the username of the user to be authenticated
* `options.password` - the password for the user

callback will be called with an Error object if an error occurs, otherwise
the config received from the OpenHIM-core server is returned.
