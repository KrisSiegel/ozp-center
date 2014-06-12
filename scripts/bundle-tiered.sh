#!/bin/bash

function echorun {
    echo "$@"
    "$@"
}

TARGET_DIR=builds/

SERVICES_BUILD_DIR=$(basename $(pwd))
UI_BUILD_DIR=ozone-ui-build

SERVICES_INSTALL_FILE=$TARGET_DIR/ozone-services.tgz
UI_INSTALL_FILE=$TARGET_DIR/ozone-ui.tgz

echo Fetching dependencies...
npm install
bower install --force --config.interactive=false;
echo Done.

echo Building Ozone API
grunt build
echo Done.

#Make a sister directory which will contain the layout of the UI server only
mkdir -p ../$UI_BUILD_DIR/public \
    ../$UI_BUILD_DIR/ozone-modules/ozone-api

mv apps ../$UI_BUILD_DIR
mv public/lib ../$UI_BUILD_DIR/public
cp -r config package.json main.js server.js ../$UI_BUILD_DIR
OZONE_API_DIR=ozone-modules/ozone-api
cp $OZONE_API_DIR/client-*.js $OZONE_API_DIR/server*.js $OZONE_API_DIR/package.json ../$UI_BUILD_DIR/$OZONE_API_DIR
cp -r ozone-modules/ozone-services-client-configuration ../$UI_BUILD_DIR/ozone-modules
cd ..

# Build the services installation tarball
mkdir -p $TARGET_DIR
echorun tar zcvf $SERVICES_INSTALL_FILE --exclude public $SERVICES_BUILD_DIR/[^R]*

# Build the services installation tarball
# It'll be quicker to steal the nod_modules directory than to copy it over
# We're in the parent directory now...
mv $SERVICES_BUILD_DIR/node_modules $UI_BUILD_DIR
tar zcvf $UI_INSTALL_FILE $UI_BUILD_DIR
