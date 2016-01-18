# riot-control
A simple Rails-inspired router for Riot.js

## Quick start

Install:

```npm install riot-control```

Routing code:

```
var RiotControl = require('riot-control');

var routes = {
  // Route
  home: function() { riot.mount('#view', 'homepage'); },
  // Root route
  '': function() { riot.mount('#view', 'index'); },
  // Nested routes
  pages: {
    '': function() { riot.mount('#view', 'pages-index'); },
    about: function() { riot.mount('#view', 'about'); },
    contact: function() { riot.mount('#view', 'contact'); }
  },
  // Dynamic parameters
  users: {
    ':id': function() { riot.mount('#view', 'user-details'); }
  },
  // Fallback
  '*': function() { riot.mount('#view', 'homepage'); }
};

var router = new RiotControl(routes);
```
