Apps Mall supports two production configurations: single installation and tiered deployment.  In tiered deployment, Web content for Apps Mall may be served from one host while the Ozone API services are served from another host.  This section covers how to create packages for deployment on a production host or hosts in either of these configurations.

##Building Apps Mall

Your build machine will need to have all the prerequisites, as described in the [Getting Started](getting-started.md) document.

Install the latest source, or extract the ZIP download in a directory that is relatively uncluttered.  The scripts will create two sister directories to the top-level of the Apps Mall, called builds and ozone-ui-build

```
mkdir appsmall-build
cd appsmall-build
git clone git@github.com:ozone-development/aml-center.git
cd aml-center

# or if you're using the ZIP file...
mkdir -p appsmall-build/aml-center
cd appsmall-build/aml-center
unzip ~/Downloads/AppsMall-2.0.0-sprint-8-beta.zip
```

###Single Installation

Be sure to properly edit your configuration files for your target system and configuration, to include the package.json, as detailed in [Configuring Apps Mall and Ozone Platform](configuration.md).

From the top-level directory described above, run

```
./scripts/bundle-single.sh
```

This will create a sister directory to your current directory, called "builds", and place a file called ozone-appsmall.tgz in it.

###Building for Tiered Deployment

Be sure to properly edit your configuration files for your target system and configuration, to include the package.json, as detailed in [Configuring Apps Mall and Ozone Platform](configuration.md).
Note, however, that the build script for tiered deployment will edit the config/defaults.js as well as the custom config file specified in ```package.json```; those changes are described below.

From the top-level directory, run
```
./scripts/bundle-tiered.sh
```

It will prompt you for two inputs.  First,

```
Enter the URL where the Ozone services will be hosted from
(e.g., http://my-ozone-host.com -- leave blank for no setting):
```

This is mostly self-explanatory; if there is a non-standard port that is being used, that should be included in the URL.

The next prompt is as follows:
```
Enter the port where the UI server should run on:
```
Note that this prompt is for the host that will host the Web content.  If you leave this blank, the server for the Web content will run at the port specified in the "server" section of the configuration file.

After you have responded to the prompts, the script will create a sister directory to the top-level directory, called "builds", and place two tarballs in it, ozone-services.tgz and ozone-ui.tgz.

Note that the bundle-tiered.sh script is destructive to the starting directory.  It creates a sister directory, ozone-ui-build and moves the apps and public/lib directories over to that directory, since they are not needed by the API server.
It also moves the node_modules over, since that is very large and doing a recursive copy would take a long time.  Finally, it modifies the custom config script indicated by package.json.

##Deploying Apps Mall
