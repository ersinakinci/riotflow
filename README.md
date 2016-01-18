# Riot Control
A simple Rails-inspired router for Riot.js

## Quick start

Install:

`npm install riot-control`

Routing code:

```node
var RiotControl = require('riot-control');

var routes = {
  home: function() { riot.mount('#view', 'homepage'); },
  '': function() { riot.mount('#view', 'root'); },
  pages: {
    '': function() { riot.mount('#view', 'pages-index'); },
    about: function() { riot.mount('#view', 'about'); },
    contact: function() { riot.mount('#view', 'contact'); }
  },
  users: {
    ':id': function() { riot.mount('#view', 'user-details'); }
  },
  // Fallback (e.g., #/wubadubadubdub)
  '*': function() { riot.mount('#view', 'homepage'); }
};

var router = new RiotControl(routes);
```

(Place the routing code wherever you like. I fancy putting it inside of a Riot tag container, like this:)

```html
<app>
  <div id="view" />
  ...
  <script>
    ...routing code goes here...
  </script>
</app>
```

## Overview

Riot Control provides Rails-like routing for your Riot.js-based web app. The intention was to keep the code simple and to use Riot.js' built-in routing capabilities.

## Events

Riot Control emits events using Riot's observable API to objects that are registered with the router. To register an object:

```node
var router = new RiotControl(routes);

...

riot.router.registerObserver(tag);
```

Note that any new Riot Control instance adds itself as the `router` property on the Riot module. This allows for writing self-registering tags:

```html
<doohickey>
  ...
  <script>
    riot.router.registerObserver(this);
  </script>
</doohickey>
```

Registered observers can receive three events from Riot Control: `routeMatch`, `routeFallback`, and `routeFailure`. The requested hash `path` and any dynamic `params` are passed in as arguments to the event callback.

### routeMatch

Indicates that the router successfully matched the request with a route.

```node
this.on('routeMatch', function(path, params) {
  console.log(path + " is a valid path.");
});
```

### routeFallback

Indicates that the router wasn't able to match the request with a route, so the fallback route (`'*'`) was used.

```node
this.on('routeFallback', function(path, params) {
  console.log(path + " could not be found, so the callback route was called.");
}
```

### routeFailure

Indicates that the router was unable to match the request with any route. Consider this a 404.

```node
this.on('routeFailure', function(path, params) {
  console.log(path + " could not be found. Rigor mortis.");
}
```

## Dynamic parameters

Riot Control passes the `params` object to registered event handlers, which contains any parameters that were in the requested hash path. In order to use this feature, parameters must be indicated in the routes object using keys that are prefixed with colons (e.g., `:id`).

```node
var routes = {
  users: {
    ':id': function() { ... }
  }
}

...

this.on('routeMatch', function(path, params) {
  if(path.substring(0, 6) == "/users") {
    console.log("User " + params.id + " was requested.");
  }
});
```
