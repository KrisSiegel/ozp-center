# Ozone API

## Server API

## Client API

(From Kris's email)

Run:

`grunt compile-client-api`

Which will take all files and configuration options form package.json and write the combined and minified versions of the API directly to the specified locations (so root directly of ozone-api as client-api.js and client-api.min.js).

There are 3 main items in the client side API.

1. Ozone.config() will take a JavaScript object with whatever properties you want and combine it with the existing configuration. You can call it multiple times if you want to bring in multiple configuration items over but the most important piece is this is where we will, going forward, specify what URL should be used for Ozone services.

Ozone.config({ servicesUrl: "http://localhost:3000/api/" });
Ozone.config().servicesUrl;

2. Ozone.extend() works a lot like jQuery's extend and allows us to separate logic while making the API malleable for others. This is how all Ozone API changes are done within the API itself (config is built with extend).

Ozone.extend(function () {
    return {
        say: function () { alert("Hello, World!"); }
    }
}());
Ozone.say();

3. Ozone.Service() works exactly like the server-side API; you specify the service name only to access it's methods or you specify the name and service to register the service itself.

Ozone.Service("HelloWorld", (function () {
    return: {
        say: function () { alert("Hello, World!"); }
    }
}()));
Ozone.Service("HelloWorld").say();

Now extend and Service are pretty similar; the main goal was for extend to literally modify the Ozone API and for Service to provide a wrapped method around any service; really it's mostly semantics but ideally it'll help separate these types of things (plus it's already what we do in the backend; I just introduced extend to make the code more modular).
