/*
 * GET home page.
 */

module.exports = function (Ozone) {
    var bundle = Ozone.config().getClientProperty("serveMinified"),
        includes = Ozone.config().getClientProperty("appsMall.includes"),
        minifiedIncludes = Ozone.config().getClientProperty("appsMall.minifiedIncludes");

    return {
        index: function(req, res){
            res.render('index', {
                bundleComponents: bundle,
                searchBar: true,
                angularIncludes: includes,
                Ozone: Ozone,
                minifiedIncludes: minifiedIncludes
            });
        },
        manage: function (req, res) {
            var innerRenderPath = req.params.service;
            var opts = {
                Ozone: Ozone,
                bundleComponents: bundle,
                searchBar: false,
                groupedFacets: innerRenderPath == "tags",
                angularIncludes: includes,
                minifiedIncludes: minifiedIncludes
            };
            switch (innerRenderPath) {
            case "apps":
                if(req.originalUrl.indexOf('/apps/submission/') >= 0){
                    res.render('manage/apps/submission', opts);
                }else{
                    res.render('manage/apps', opts);
                }
                return;
            case "categories":
                opts.thingSingular = "category";
                opts.thingPlural = "categories";
                opts.menuIconClass = "icon-file";
                opts.menuIconClass2 = "icon-box";
                opts.menuText = "Add to Categories";
                opts.tagTopic = "Category";
                break;
            case "collections":
                opts.thingSingular = "collection";
                opts.thingPlural = "collections";
                opts.menuIconClass = "icon-file";
                opts.menuIconClass2 = "icon-box";
                opts.menuText = "Add to Collection";
                opts.tagTopic = "Collection";
                break;
            case "tags":
                opts.thingSingular = "tag";
                opts.thingPlural = "tags";
                opts.menuIconClass = "icon-tag2";
                opts.menuIconClass2 = "icon-box";
                opts.menuText = "Select Tags to Add";
                opts.tagTopic = "App";
                break;
            };
            if ('sub1' in req.params) {
                innerRenderPath = innerRenderPath + '/' + req.params.sub1;
            }
            res.render('manage/layout', opts);
        }
    }
};
