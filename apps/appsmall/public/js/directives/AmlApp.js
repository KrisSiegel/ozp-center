/**
 * 
 *
 * @module directivesModule
 * @submodule AmlAppModule
 * @requires amlApp.directives
 */
'use strict';

function getId(theObject) {
    return theObject._id;
};

function resetModalTabs() {
    $(".detailed-app-0").find(".nav-tabs").find(".active").removeClass("active");
    $(".detailed-app-0").find(".tab-content").find(".active").removeClass("active");
    $(".overview-tab, .overview-content").addClass("active");
};

/**
 * HTML element directive: Renders HTML for a single application on the AppsMall main page or App Management page.
 *
 * Usage: ```<amlapp no-featured="false" featured-banner="false" no-click="false"></amlapp>```
 *
 * @class AmlAppDirective
 * @static
 */ 

/**
 * @class AmlAppDirective
 * @constructor
 * @param FileUpload {Object} an Angular-injected instance of {{#crossLink "FileUploadService"}}{{/crossLink}}
 * @param Tag {Object} an Angular-injected instance of {{#crossLink "TagService"}}{{/crossLink}}
 */

/**
 * The App object to be displayed as HTML
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(must exist in parent scope)**_
 *
 * @attribute {Object} app
 * @required
 */

/**
 * If set to true, then the app will always appear as standard (non-featured).
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter) **_
 *
 * @attribute {Boolean} no-featured
 * @optional
 * @deprecated
 */

/**
 * If set to true, then the app HTML will not contain a launch button.
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter) **_
 *
 * @attribute {Boolean} no-launch
 * @optional
 */

/**
 * If set to true, then the app will not open a modal when clicked.
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter) **_
 *
 * @attribute {Boolean} no-click
 * @optional
 */

/**
 * If set to true, then the app will always appear as a featured app.
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter) **_
 *
 * @attribute {Boolean} featured-banner
 * @optional
 */

var AmlAppDirective = ['FileUpload', 'Tag', function(FileUpload, Tag) {
    function getBannerIcon(app, isLargeBanner) {
        if (app && app.featured && isLargeBanner) {
            var bannerId = ((app && app.images) || {}).featuredBannerId;
            return FileUpload.getFileUrl(bannerId, "featuredBanner");
        }
        else {
            var bannerId = ((app && app.images) || {}).smallBannerId;
            return FileUpload.getFileUrl(bannerId, "smallBanner");
        }
    }

    function getSquareIcon(app) {
        var iconId = ((app && app.images) || {}).iconId;
        return FileUpload.getFileUrl(iconId, "icon");
    }

    return {
        restrict: 'E',
        replace: true,
        transclude: 'element',
        template: '<div class="single-app" ng-class="{\'featured\-app\': isFeatured(app)}">' +
                    '<div ng-show="hasTopBar()" style="height:25px; background-color:#444;"><button type="button" class="btn btn-danger" ng-click="removeTagFromApp(null,null,app)">X</button></div>' +
                    '<a class="nolink app-link"><div class="single-app-outer-frame"><div class="single-app-inner-frame">' +
                        '<div class="single-app-main">' +
                             // '<img ng-src={{getBannerIcon(app)}} alt={{app.name}} class="image banner-icon" /> <div class="name">{{app.name}}</div>' +
                             // '<div class="trait">{{app.users}} users</div> <div class="organization-badge">{{getOrganization()}}</div>' +
                             '<img ng-src={{getBannerIcon(app)}} alt={{app.name}} class="image banner-icon" />' +
                             '<div class="single-app-main-details clearfix">'+
                             '<div class="name">{{app.name}}</div>' +
                             '<star-rating num-stars="{{app.rating}}" ng-model="app.rating" class="nofeatured-only"></star-rating>' +
                             '<div class="organization-badge">{{getOrgTag(app.shortname)}}</div>' +
                             '</div>' +
                        '</div>' +
                        '<div class="single-app-hover clearfix">' +
                            '<div class="featured-app-hover-details clearfix">' +
                                '<img ng-src={{getSquareIcon(app)}} alt={{app.name}} class="icon nofeatured-only" /><div class="name">{{app.name}}</div>' +
                                '<star-rating num-stars="{{app.rating}}" ng-model="app.rating" class="nofeatured-only"></star-rating>' +
                                '<rating-count-bar app="app" class="nofeatured-only"></rating-count-bar>' +
                                '<button ng-click="setBookmark(app)" class="btn bookmark app-usermode-button" ng-class="{\'bookmark\-selected\': isBookmarked(app)}"><i class="icon-single-app-hover icon-bookmark"></i></button>'+
                                '<button ng-click="openApp(app)" data-id="{{getId(app)}}" class="btn btn-primary add app-usermode-button">Launch App</button>' + // <i class="icon-plus icon-white"></i>
                            '</div>' +
                            '<div class="description">{{app.descriptionShort | limitTo:150}}</div>' +
                        '</div> ' +
                    '</div></div></a>' +
                  '</div>',
        link: function(scope, element, attrs) {
            scope.orgTags = [];
            Tag.getTags({
                topic: '/AppsMall/Organization/'
            }).then(function (tags) {
                if(!_.isEmpty(tags)) {
                    scope.orgTags =  tags;
                }
            });
            scope.getOrgTag = function(shortname){
                var orgTag = _.find(scope.orgTags, function(tag){
                    return tag.uri === '/AppsMall/Apps/' + shortname;
                });
                return orgTag === undefined ? '' : orgTag.tag;
            }

            scope.isFeatured = function(app) {
                return (app && app.featured && common.convertBooleanText(attrs.featuredBanner));
            }

            scope.hasTopBar = function(bannerApp) {
                return common.convertBooleanText(attrs.topBar);
            };

            // functions for getting icons
            scope.getBannerIcon = function(bannerApp) {
                return getBannerIcon(bannerApp, common.convertBooleanText(attrs.featuredBanner));
            };

            scope.getSquareIcon = function(bannerApp) {
                return getSquareIcon(bannerApp);
            };

            var mouseOverFunction = function(element) {
                if (!($(element).hasClass('no-hover-animate'))) {
                    var frameNewTop = $(element).find('.single-app-hover').height() * -1;
                    var animatedFrameSelector = ((scope.isFeatured(scope.app)) ? '.single-app-inner-frame .single-app-hover' : '.single-app-inner-frame');
                    $(element).find(animatedFrameSelector).animate({
                        top: frameNewTop
                    }, {
                        queue: false,
                        duration: 80
                    });
                }
            };

            var mouseOutFunction = function(element) {
                if (!($(element).hasClass('no-hover-animate'))) {
                    var animatedFrameSelector = ((scope.isFeatured(scope.app)) ? '.single-app-inner-frame .single-app-hover' : '.single-app-inner-frame');
                    $(element).find(animatedFrameSelector).animate({
                        top: 0
                    }, {
                        queue: false,
                        duration: 80
                    });
                }
            };

            // handles animation
            $(element).mouseover(function() { return mouseOverFunction(this); }).mouseout(function() { return mouseOutFunction(this); });

            // search box click event that launches app modal.  The event object is needed to differentiate between used clicking
            // on the Launch button inside the box, and clicking on the box outside the Launch button.
            // If the 'nolaunch' attribute exists, then click event and Launch button will not get added.
            if (common.convertBooleanText(attrs.noLaunch)) {
                $(element).find('button.app-usermode-button').remove();
            }

            if (!attrs.noClick) {
                $(element).click(function(event) {
                    // if user clicks on anything other than a button (or the child node of any button), then launch modal.
                    if ($(event.target).closest('button').length === 0) {
                        resetModalTabs();
                        scope.$parent.$apply(function() {
                            scope.$parent.loadAppChildForm(scope.app);
                        })
                    }
                });
            }
        }
    };
}];

directivesModule.directive('amlapp', AmlAppDirective);
