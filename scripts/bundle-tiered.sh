#!/bin/bash

set -e

function echorun {
    echo "$@"
    "$@"
}

STARTDIR=$(pwd)

TARGET_DIR=$STARTDIR/../builds

SERVICES_BUILD_DIR=$(basename $STARTDIR)
UI_BUILD_DIR=ozone-ui
STATIC_BUILD_DIR=ozone-static

SERVICES_INSTALL_FILE=$TARGET_DIR/ozone-services.tgz
UI_INSTALL_FILE=$TARGET_DIR/ozone-ui.tgz
STATIC_INSTALL_FILE=$TARGET_DIR/ozone-static.tgz

# Now collect some values for the "client" section of default.js
echo "Enter the URL where the Ozone services will be hosted from"
echo -n "(e.g., http://my-ozone-host.com -- leave blank for no setting): "
read -e SERVICES_BASE_URL

#echo -n "Enter the port where the UI server should run on: "
#read -e CLIENT_PORT

echo "Enter the URL where Apps Mall static files (*.js, *.css, etc.) will be hosted from,"
echo -n "if the host/port is different from the HUD or AML start page: "
read -e STATIC_BASE_URL

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


# Move client-only stuff to client dir, and copy some things over before we start modifying things
mv apps ../$UI_BUILD_DIR
mv public/lib ../$UI_BUILD_DIR/public

CUSTOM_CONFIG=$(awk '/"environment" *:/ { print substr($2, 2, length($2) - 3) }' $STARTDIR/package.json).js
DEFAULT_CONFIG=default.js # Not currently used for server, but used for client
cd config/environments
mv $CUSTOM_CONFIG orig-$CUSTOM_CONFIG
$STARTDIR/scripts/config-servers.awk -v SVC_URL="$SERVICES_BASE_URL" -v STATIC_URL="$STATIC_BASE_URL" orig-$CUSTOM_CONFIG > $CUSTOM_CONFIG

cd $STARTDIR
cp -R config package.json main.js server.js ../$UI_BUILD_DIR
OZONE_API_DIR=ozone-modules/ozone-api
cp $OZONE_API_DIR/client-*.js $OZONE_API_DIR/server*.js $OZONE_API_DIR/package.json ../$UI_BUILD_DIR/$OZONE_API_DIR
cp -R ozone-modules/ozone-services-client-configuration ../$UI_BUILD_DIR/ozone-modules

#Fix config for server installation
cd config/environments
mv $CUSTOM_CONFIG orig-$CUSTOM_CONFIG
$STARTDIR/scripts/service-custom-config.awk orig-$CUSTOM_CONFIG > $CUSTOM_CONFIG
# Build the services installation tarball
cd $STARTDIR/..


#Fix config for client installation
cd $UI_BUILD_DIR/config
mv $DEFAULT_CONFIG orig-$DEFAULT_CONFIG
$STARTDIR/scripts/ui-default-config-adjust.awk orig-$DEFAULT_CONFIG > $DEFAULT_CONFIG
cd environments
mv $CUSTOM_CONFIG orig-$CUSTOM_CONFIG
$STARTDIR/scripts/ui-custom-config-adjust.awk orig-$CUSTOM_CONFIG > $CUSTOM_CONFIG

if [ -n "$STATIC_BASE_URL" ]
then
    cd $STARTDIR/..
    mkdir $STATIC_BUILD_DIR
    mv $UI_BUILD_DIR/public/lib $STATIC_BUILD_DIR
    mkdir -p $STATIC_BUILD_DIR/AppsMall
    cd $UI_BUILD_DIR/apps/appsmall/public
    mv css ext-lib fonts img js $STARTDIR/../$STATIC_BUILD_DIR/AppsMall
    cd ../../ozone-hud/public
    mv components assets $STARTDIR/../$STATIC_BUILD_DIR
    cd $STARTDIR/..
    mkdir -p $STATIC_BUILD_DIR/api/client
    mv $UI_BUILD_DIR/ozone-modules/ozone-api/client-*.js $STATIC_BUILD_DIR/api/client
fi

cd $STARTDIR/..

echo Creating services tarball....
echorun tar zcf $SERVICES_INSTALL_FILE --exclude public $SERVICES_BUILD_DIR/[^R]*
echo Done.


# It'll be quicker to steal the node_modules directory than to copy it over
# We're in the parent directory now...
mv $SERVICES_BUILD_DIR/node_modules $UI_BUILD_DIR

echo Creating UI tarball....
echorun tar zcf $UI_INSTALL_FILE $UI_BUILD_DIR
echo Done.

if [ -n "$STATIC_BASE_URL" ]
then
    echo Creating static install tarball....
    echorun tar zcf $STATIC_INSTALL_FILE $STATIC_BUILD_DIR
    echo Done.
fi
echo
echo Check for complete tarballs in $TARGET_DIR
echo 
echo Remember to change the server port on each installation if needed.
