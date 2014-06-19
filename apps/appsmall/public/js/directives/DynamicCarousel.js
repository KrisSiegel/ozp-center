/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI.DynamicCarouselModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML attribute directive:
 *
 * Usage: ```<[element] dynamic-carousel="[Boolean]" num-items="[Number]" is-auto="[Boolean]" on-image-click="[Function]" width=[Int] height=[Int] timeout=[Int]></[element]>```
 *
 * @class AppsMallUI.DynamicCarouselDirective
 * @static
 */ 

/**
 * @class AppsMallUI.DynamicCarouselDirective
 * @constructor
 * @param $timeout {Function} Angular wrapper for window.setTimeout - [API Documentation](https://docs.angularjs.org/api/ng/service/$timeout) 
 */

/**
 * Dynamic carousel functionality only gets added if true
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter, with bound watcher event) **_
 *
 * @attribute {Boolean} dynamic-carousel
 * @optional
 */

/**
 * Method that gets called when users click on any image in carousel
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 2-way binding)**_
 *
 * @attribute {Function} on-image-click
 * @optional
 */

/**
 * Number of apps visible in carousel at any one time
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter) **_
 *
 * @attribute {Number} num-items 
 * @optional
 */

/**
 * Boolean flag for determining whether carousel auto-scrolls
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter) **_
 *
 * @attribute {Boolean} is-auto
 * @optional
 */

/**
 * If defined, the width of all apps will get set to this value.
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter) **_
 *
 * @attribute {Number} width
 * @optional
 */

/**
 * If defined, the height of all apps will get set to this value.
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter) **_
 *
 * @attribute {Number} height
 * @optional
 */

/**
 * Delays creation of dynamic carousel, so that pre-render methods can be called.
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter) **_
 *
 * @attribute {Number} timeout
 * @optional
 */

var DynamicCarouselDirective = ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        scope: {
            onImageClick: '='
        },
        link: function(scope, element, attrs) {
            var previousFrameWidth;
            attrs.onImageClick = scope.onImageClick;

            // APPSMALL-382: number of items per row, used as dynamic value for responsive width adjustment on all main page carousels.
            // (If numItems is set, then use that value instead of the responsive adjustment sizes.)
            var numItemsPerRow = function(defaultNumItems) {
                var numItems;
                if (defaultNumItems) {
                    return defaultNumItems;
                }
                var frameWidth = $('div.interface').width();
                if (frameWidth < 1024) {
                    if ((frameWidth > 800) && (previousFrameWidth < frameWidth)) {
                        numItems = 3; // frame is in mid-animate going from 800 to 1024
                    }
                    else {
                        numItems = 2;
                    }
                }
                else if (frameWidth < 1260) {
                    if ((frameWidth > 1024) && (previousFrameWidth < frameWidth)) {
                        numItems = 4; // frame is in mid-animate going from 1024 to 1260
                    }
                    else {
                        numItems = 3;
                    }
                }
                else {
                    numItems = 4;
                }
                previousFrameWidth = frameWidth;
                return numItems;
            };

            // setting watch that creates carousel if watch variable = true
            scope.$watch(attrs.dynamicCarousel, function() {
                if (common.convertBooleanText(attrs.dynamicCarousel)) {
                    $timeout(function() {
                        var randomId = common.generateId();
                        var prevId = ("prev" + randomId), nextId = ("next" + randomId), pagerId = ("pager" + randomId);

                        var numScrollItemsPerRow = function() { 
                            return (common.convertBooleanText(attrs.isFeaturedCarousel) ? 1 : numItemsPerRow(attrs.numItems)); 
                        };
                        var numDefaultItemsPerRow = function() { 
                            if (attrs.numItems) {
                                return parseInt(attrs.numItems) || 1;
                            }
                            return (common.convertBooleanText(attrs.isFeaturedCarousel) ? 2 : 4); 
                        };

                        var carouFredSelOpts = {
                            items: numDefaultItemsPerRow,
                            direction: "left",
                            auto: false,
                            scroll: {
                              items: numScrollItemsPerRow,
                              duration: 500,
                              timeoutDuration: 2000,
                              pauseOnHover: true
                            },
                            prev: ('#' + prevId),
                            next: ('#' + nextId),
                        };
                        if (attrs.width && attrs.height) {
                            carouFredSelOpts.width = attrs.width;
                            carouFredSelOpts.height = attrs.height;
                        }
                        if (attrs.carouselPaginatorId) {
                            carouFredSelOpts.pagination = {
                                container: ("#" + attrs.carouselPaginatorId),
                                keys: false
                            };
                        }

                        if (common.convertBooleanText(attrs.isAuto)) {
                            carouFredSelOpts.auto = true;
                        }
                        if (common.convertBooleanText(attrs.isFeaturedCarousel)) {
                            // for featured carousels: add 1 item to visible panel, so that half of the first and last item appear on each end.
                            carouFredSelOpts.items = carouFredSelOpts.items + 1;
                            carouFredSelOpts.auto = true;
                            carouFredSelOpts.scroll.onAfter = function(data) {
                                var $apps = data.items.visible.find('.single-app');
                                $apps.removeClass('no-hover-animate');
                                $apps.first().addClass('no-hover-animate');
                                $apps.last().addClass('no-hover-animate');
                            }
                        }

                        var adjustWidthForFeaturedCarousels = function() {
                            if (common.convertBooleanText(attrs.isFeaturedCarousel)) {
                                var _width = parseInt($(element).attr('width'));
                                // width per item = entire width divided by old number of items
                                var _widthPerItem = _width / (carouFredSelOpts.items - 1); 

                                var featuredMargin;
                                switch(numItemsPerRow(attrs.numItems)) { 
                                    case 2: 
                                        featuredMargin = -493;
                                        break; 
                                    case 3: 
                                        featuredMargin = -361;
                                        break; 
                                    case 4: 
                                        featuredMargin = -240; 
                                        break; 
                                }
                                $(element).css('margin-left', featuredMargin);
                                $(element).addClass('caroufredsel_wrapper_inner');

                                // adding negative-margin CSS to back container with all images
                                // RWP 4/11/14: added 4 pixels to featured carousel margin (shifting to the right) so that featured carousel aligns with other carousels.
                                //$(element).css('margin-left', (_widthPerItem / -2) + 4);
                                //$(element).closest('.caroufredsel_wrapper').width(_width);
                                carouFredSelOpts.scroll.onAfter({items:{visible: $(element).find('.app-container').slice(0,carouFredSelOpts.items) }});
                            }
                        }

                        // configuring carousel element
                        var createCarouFredSelFunction = function() {

                            $(element).before('<div class="button-wrapper" style="width:20px;height:' + attrs.height + 'px;"><button id="' + prevId + '" class="btn" style="margin:10px 0 0 0;"><span class="icon-arrow-left"></span></button></div>')
                                      .after( '<div class="button-wrapper" style="width:20px;height:' + attrs.height + 'px;text-align:left"><button id="' + nextId + '" class="btn" style="margin:10px 0 0 0;"><span class="icon-arrow-right"></span></button></div>')
                                      .carouFredSel(carouFredSelOpts);

                            // if featured-item carousel, then adjust carousel so that back panel with all carousel items is shofted over half the length of a carousel item.
                            // That way, the leftmost and rightmost items only half-appear on each end.
                            adjustWidthForFeaturedCarousels();

                            // make carousel wrapper element an inline-block so that prev/next buttons appear on each side,
                            // and expand container div so that buttons fit on each side
                            $(element).parent().css('display','inline-block').parent().css('width','+=100');
                            $(element).find('btn').show();

                            // add modal-on-click functionality, if appropriate attribute was set
                            if (_.isFunction(attrs.onImageClick)) {
                                var clickWrapperFunction = function(event) { 
                                    attrs.onImageClick($(event.target).attr('src'));
                                };
                                $(element).find('img').click(clickWrapperFunction);
                            }
                        };

                        if (common.convertBooleanText(attrs.isFeaturedCarousel)) {
                            $(window).resize(adjustWidthForFeaturedCarousels);
                        }

                        if (attrs.timeout) {
                            $timeout(createCarouFredSelFunction, attrs.timeout);
                        }
                        else {
                            createCarouFredSelFunction();
                        }
                    }, 200);
                }
                else {
                    $(element).css('margin-left', '0');
                }
            });
        }
    };
}];


directivesModule.directive('dynamicCarousel', DynamicCarouselDirective);
