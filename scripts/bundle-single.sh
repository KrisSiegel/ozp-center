#!/bin/bash

TARGET_DIR=builds/

THIS_DIR=$(basename $(pwd))

SINGLE_INSTALL_FILE=$TARGET_DIR/ozone-appsmall.tgz

echo Fetching dependencies...
npm install
bower install --force --config.interactive=false;
echo Done.

echo Building Ozone API
grunt build
echo Done.

cd ..
mkdir -p $TARGET_DIR
tar zcvf $SINGLE_INSTALL_FILE $THIS_DIR/[^R]*
