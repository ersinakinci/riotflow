require('riot');

var Router = function(routes) {
  this._registeredObservers = [];
  this._routes = routes;

  riot.route.stop();
  riot.route.start();
  riot.route(this._router.bind(this));
  riot.route.exec();
  riot.router = this;
};

Router.prototype.registerObserver = function(el) {
  this._registeredObservers.push(el);
};

Router.prototype._matchTargetSegmentToRouteName = function(targetSegment, routeName) {
  if (targetSegment == routeName) {
    return true;
  } else if (routeName[0] == ':') {
    return 'symbol';
  } else {
    return false;
  }
};

// Recursive function for matching paths to routes
Router.prototype._matchRoute = function(segments, depth, routes) {
  var targetSegment = segments[depth];
  var params = {};

  for (var routeName in routes) {
    if (routes.hasOwnProperty(routeName)) {
      // If the segment at the current level matches a route on that level,
      // try to resolve the route
      if(this._matchTargetSegmentToRouteName(targetSegment, routeName)) {
        // Extract params from path segments
        if (this._matchTargetSegmentToRouteName(targetSegment, routeName) == 'symbol') {
          params[routeName.substr(1)] = targetSegment;
        }

        // A function means that we can resolve the route
        if(typeof(routes[routeName]) == 'function') {
          return {params: params, routeFunction: routes[routeName], matched: true};
        // An object means that we need to go into subroutes
        } else if (segments.length > depth + 1) {
          return this._matchRoute(segments, depth + 1, routes[routeName]);
        // Only accept functions, arrays, and objects
        } else {
          return {params: params, routeFunction: undefined, matched: false};
        }
      }
    }
  }

  // If matching fails, fall back to catchall
  return {params: params, routeFunction: routes['*'] || undefined, matched: false};
};

Router.prototype._notifyRegisteredObservers = function(path, params) {
  this._registeredObservers.forEach(function(observer, i, observers) {
    observer.trigger(path, params);
  })
};

Router.prototype._router = function() {
  // Fancy code to avoid killing arguments optimization
  // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
  var pathSegments = new Array(arguments.length);
  for(var i = 0; i < pathSegments.length; ++i) {
    pathSegments[i] = arguments[i];
  }
  // Add trailing '' if it doesn't exist yet so that index routes in subroutes
  // get processed
  if (pathSegments.length > 1) {
    pathSegments.push('');
  }
  var routeInfo = this._matchRoute(pathSegments, 0, this._routes);
  var path = '/' + pathSegments.join('/');

  if (routeInfo && routeInfo.routeFunction) {
    var routeFunction = routeInfo.routeFunction;
    var params = routeInfo.params;

    routeFunction(path, params);
    if(routeInfo.matched) {
      this._notifyRegisteredObservers('routeMatch', path, params)
    } else {
      this._notifyRegisteredObservers('routeFallback', path, params)
    }
  } else {
    console.error('Failed to find route for path "' + path + '".');
    this._notifyRegisteredObservers('routeFailure', path, null)
  }
};

module.exports = Router;
