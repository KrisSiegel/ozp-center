/**
   When the minified version of the HUD is deployed, external fonts go
   missing because there are CSS files that refer to the font files
   using relative paths.  In minified form, those rules are no longer
   in the original files, but are now embedded in the main page.

   To fix this (quick-and-dirty), we just copy the font files to the
   place where the rule is looking for them.
*/

var cp = require('child_process'),
    mkdirp = require('mkdirp');



module.exports = function (grunt) {
    function copyFonts () {

        var fonts = [
            "permission-icons.eot",
            "permission-icons.svg",
            "permission-icons.ttf",
            "permission-icons.woff",
        ].map(function(file) {
            return "apps/ozone-hud/public/components/ozone-persona-permissions/fonts/permission-icons/fonts/" + file;
        });
        var destdir = 'apps/ozone-hud/public/fonts/permission-icons/fonts';
        mkdirp.sync(destdir);
        var done = grunt.task.current.async(); // Tells Grunt that an async task is complete
        var proc = cp.spawn("cp", fonts.concat([destdir]));
        proc.on('exit', function (code, signal) {
            done();
        });

    }
    grunt.registerTask('copy-fonts', 'Makes a copy of font files in new locations for minified deployment', copyFonts);
}
