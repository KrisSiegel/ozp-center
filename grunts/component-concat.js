/**
    This task provides web component combination for the Ozone HUD; it combines the HTML of multiple
    web components into a single html file for inclusion.
*/
function catComponents () {

    var fs = require('fs'),
        path = require('path'),
    //async = require('async'),
    $ = require('cheerio'),
    //_ = require('underscore'),
        pack = require('../package.json'),
    newScripts = $.load('');

    var htmlList = pack.hudComponentPaths,
        hudPrefix="apps/ozone-hud/public/"

    var bar = hudPrefix + "components/ozone-bar/ozone-bar.html";

    var cssNameArray = [],
        cssSet = {};
    var jsArray = [];
    var templateArray = [];

    htmlList.forEach(function (partialFilename) {
        var filename = hudPrefix + partialFilename,
        dir = filename.replace(/[^\/]*$/, ""),
        f = fs.readFileSync(filename);

        // Get all the stylesheet references and concatenate them
        var $source = $.load(f);
        var $link = $source('link').remove();
        //console.log($source.html());
        //console.log($link.html('link'));
        //console.log($source);

        var innerCssArray = [];
        $link.each(function () {
            var cssbase = $(this).attr('href');
            var cssFqp = path.normalize(dir + cssbase);
            //console.log("cssFqp = " + cssFqp);
            innerCssArray.push(cssFqp);
        });
        cssNameArray.push.apply(cssNameArray, innerCssArray);
        function uniquifyFromEnd(inArray) {
            var set = {},
                outArray = [];
            for (var i = inArray.length; i; ) {
                var val = inArray[--i];
                if (typeof set[val] !== 'undefined') {
                    continue;
                }
                set[val] = 1;
                outArray.unshift(val);
            };
            return outArray;
        }

        cssNameArray = uniquifyFromEnd(cssNameArray);

        // Do the same for external JS files
        innerJsArray = [];
        var $scriptRefs = $source('script[src][type="text/javascript"]').remove();
        $scriptRefs.each(function () {
            var scriptFqp = dir + $(this).attr('src');
            var header = "/* Source: " + scriptFqp + " */\n\n";
            innerJsArray.push(header + fs.readFileSync(scriptFqp));
        });
        jsArray.push.apply(jsArray, innerJsArray);

        // Finally, concatenate the remaining templates
        templateArray.push($source.html());
    });

    var cssContentArray = cssNameArray.map(function (cssFqp) {
        var header = "/* Source: " + cssFqp + " */\n\n";
        return header + fs.readFileSync(cssFqp);
    });

    var outputLocation = 'apps/ozone-hud/static/';
    var mondoCss = cssContentArray.join("\n/* ============================= */\n");
    //console.log(mondoCss);
    fs.writeFileSync(outputLocation + 'hud-components-micro.css', mondoCss, null && function (err) {
        if (err) throw err;
        console.log("It's saved!");
    });

    fs.writeFileSync(outputLocation + 'hud-components-micro.js', jsArray.join("\n/* ============================= */\n"), null && function (err) {
        if (err) throw err;
        console.log("It's saved!");
    });

    var mondoHtml = templateArray.join("\n<!-- ============================ -->\n").replace(/^\s*/, "");

    fs.writeFileSync(outputLocation + 'hud-components-micro.html', mondoHtml, null && function (err) {
        if (err) throw err;
        console.log("It's saved!");
    });
}

module.exports = function (grunt) {
    grunt.registerTask('component-concat', 'Extracts HTML templates, CSS and  JS from xtag/micro-xtag components, and concatenates them', catComponents);
}
