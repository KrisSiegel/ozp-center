# Ozone - App Builder

Install
====

1. Run `bower install`
2. `git submodule init && git submodule update`
3. `cd lib/deckster`
4. `make` (requires node-sass and coffee-script)

This project also depends on the following:
* Ozone Apps Service
* (for images referenced in our Apps Service data) the Ozone Applications Mall UI project in a sister directory called aml

A static file server, such as the Node app "static", or python -m SimpleHTTPServer, should be run in the parent directory.
