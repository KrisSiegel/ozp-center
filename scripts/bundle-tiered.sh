#!/bin/bash

set -e

function echorun {
    echo "$@"
    "$@"
}

STARTDIR=$(pwd)

TARGET_DIR=$STARTDIR/../builds

SERVICES_BUILD_DIR=$(basename $STARTDIR)
UI_BUILD_DIR=ozone-ui-build

SERVICES_INSTALL_FILE=$TARGET_DIR/ozone-services.tgz
UI_INSTALL_FILE=$TARGET_DIR/ozone-ui.tgz

# Now collect some values for the "client" section of default.js
echo "Enter the URL where the Ozone services will be hosted from"
echo -n "(e.g., http://my-ozone-host.com -- leave blank for no setting): "
read -e ABSOLUTE_BASE_URL

echo -n "Enter the port where the UI server should run on: "
read -e CLIENT_PORT

echo Fetching dependencies...
npm install
bower install --force --config.interactive=false;
echo Done.

echo Building Ozone API
grunt build
echo Done.

mkdir -p $TARGET_DIR

#Make a sister directory which will contain the layout of the UI server only
mkdir -p ../$UI_BUILD_DIR/public \
    ../$UI_BUILD_DIR/ozone-modules/ozone-api


echo Creating services tarball....
# Move client-only stuff to client dir, and copy some things over before we start modifying things
mv apps ../$UI_BUILD_DIR
mv public/lib ../$UI_BUILD_DIR/public
cp -R config package.json main.js server.js ../$UI_BUILD_DIR
OZONE_API_DIR=ozone-modules/ozone-api
cp $OZONE_API_DIR/client-*.js $OZONE_API_DIR/server*.js $OZONE_API_DIR/package.json ../$UI_BUILD_DIR/$OZONE_API_DIR
cp -R ozone-modules/ozone-services-client-configuration ../$UI_BUILD_DIR/ozone-modules

#Fix config for server installation
cd config/environments
CUSTOM_CONFIG=development.js
DEFAULT_CONFIG=default.js # Not currently used for server, but used for client
mv $CUSTOM_CONFIG orig-$CUSTOM_CONFIG
$STARTDIR/scripts/service-custom-config.awk orig-$CUSTOM_CONFIG > $CUSTOM_CONFIG
# Build the services installation tarball
cd $STARTDIR/..
echorun tar zcf $SERVICES_INSTALL_FILE --exclude public $SERVICES_BUILD_DIR/[^R]*
echo Done.


# It'll be quicker to steal the node_modules directory than to copy it over
# We're in the parent directory now...
mv $SERVICES_BUILD_DIR/node_modules $UI_BUILD_DIR

#Fix config for client installation
cd $UI_BUILD_DIR/config
mv $DEFAULT_CONFIG orig-$DEFAULT_CONFIG
$STARTDIR/scripts/ui-default-config-adjust.awk orig-$DEFAULT_CONFIG > $DEFAULT_CONFIG
cd environments
mv $CUSTOM_CONFIG orig-$CUSTOM_CONFIG
$STARTDIR/scripts/ui-custom-config-adjust.awk -v BASE=$ABSOLUTE_BASE_URL PORT=$CLIENT_PORT orig-$CUSTOM_CONFIG > $CUSTOM_CONFIG


cd $STARTDIR/..


echo Creating UI tarball....
echorun tar zcf $UI_INSTALL_FILE $UI_BUILD_DIR
echo Done.
echo
echo Check for complete tarballs in $TARGET_DIR
