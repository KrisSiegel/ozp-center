var Ozone = Ozone || {};
Ozone.appbuilder = Ozone.appbuilder || {};

xtag.register('xozp-builder-layout',
 {
     lifecycle: {
         created: function () {
             $(this).html('<div><iframe></iframe></div>');
         },
     },
     events: {
     }
 }
);

xtag.register('xozp-component-icon',
 {
     lifecycle: {
         created: function () {
             this.local = {};
         }
     },
     events: {
         click: function (e) {
             alert("clicked on " + this.textContent + "!");
         }
     },
 }
);

xtag.register('xozp-builder-panel',
 {
     lifecycle: {
         created: function() {
             $panel = $(this);
             $panel.height($(window).height());
             this.local = {};
         }
     },
 }
);


(function () {

    var tabsetCounter = 0;
    // Set a jQuery element to the specified height of the parent.
    function fullHeight($this) {
        var height = $this.parent().innerHeight();
        $this.outerHeight(height);
    };

    // Set a jQuery element to the specified width of the parent.
    function fullWidth($this) {
        var width = $this.parent().innerWidth();
        $this.outerWidth(width);
    };

    function setHeightDivisions($this, upperHeightPx, model, pct) {
        upperHeightPx = Math.floor(upperHeightPx);
        var parentHeight = $this.height(),
            $children = $this.children(),
            upperDiv = $children.eq(0),
            divider = $children.eq(1),
            lowerDiv = $children.eq(2),
            dividerHeight = divider.outerHeight(),
            spareHeight = parentHeight - dividerHeight,
            lowerHeight = spareHeight - upperHeightPx;

        if ($children.length != 3) {
            throw "There must be exactly three child divs"
        };
        fullWidth($this);
        upperDiv.outerHeight(upperHeightPx);
        // the above action shifts the position of the divider, for
        // some reason.  So put it back to the right place.
        divider.position({
            my: "top",
            at: "bottom",
            of: upperDiv
        }).find(".appbuilder-h-divider-handle").position({
            of: divider
        });

        lowerDiv.outerHeight(lowerHeight);
        if (!pct) {
            pct = (upperHeightPx / spareHeight) * 100;
        }
        model.upperHeightPct = pct;

        // If upper or lower div is also a partition, current implementation
        // has an intermediate div in there that we haven't addressed directly
        fullHeight(upperDiv.children());
        fullHeight(lowerDiv.children());
    };

    // $this is a "parent" div that has two vertically stacked child
    // divs which together need to occupy the full height of the div,
    // taking margins into account.
    function percentHeight($this, model) {
        if (model.type != 'hdiv') {
            //console.log("bailing from percentHeight early");
            return;
        };
        var parentHeight = $this.height(),
            $children = $this.children(),
            dividerHeight = $children.eq(1).height(),
            spareHeight = parentHeight - dividerHeight;
        setHeightDivisions($this, spareHeight * model.upperHeightPct / 100, model, model.upperHeightPct);
    };

    function setWidthDivisions ($this, leftWidthPx, model, pct) {
        leftWidthPx = Math.floor(leftWidthPx);
        var parentWidth = $this.width(),
            $children = $this.children(),
            leftDiv = $children.eq(0),
            divider = $children.eq(1),
            rightDiv = $children.eq(2),
            dividerWidth = divider.outerWidth(),
            spareWidth = parentWidth - dividerWidth,
            rightWidth = spareWidth - leftWidthPx;

        if ($children.length != 3) {
            throw "There must be exactly three child divs"
        };
        fullHeightOrWidthPartition($this, fullHeight);

        leftDiv.outerWidth(leftWidthPx);
        // the above action shifts the position of the divider, for
        // some reason.  So put it back to the right place.
        divider.position({
            my: "left",
            at: "right",
            of: leftDiv
        }).find(".appbuilder-v-divider-handle").position({
            of: divider
        });
        rightDiv.outerWidth(rightWidth);
        if (!pct) {
            pct = (leftWidthPx / spareWidth) * 100;
        }
        model.leftWidthPct = pct;

    };

    function percentWidth($this, model) {
        if (model.type != 'vdiv') {
            console.log("bailing from percentWidth early");
            return;
        };
        fullWidth($this);
        var parentWidth = $this.width(),
            $children = $this.children(),
            dividerWidth = $children.eq(1).width(),
            spareWidth = parentWidth - dividerWidth;
        setWidthDivisions($this, spareWidth * model.leftWidthPct / 100, model, model.leftWidthPct);
    };

    function fullHeightOrWidthPartition($el, sizeFix) {
        var $children = $el.children();
        sizeFix($el);
        sizeFix($children);
        // If left or right div is also a partition, current implementation
        // has an intermediate div in there that we haven't addressed directly
        sizeFix($children.eq(0).children());
        sizeFix($children.eq(2).children());
    }

    function adjustHeightWidth($el, model, changes) {
        if (model.type != 'hdiv' && model.type != 'vdiv') {
            return // nothing to do
        };
        var $children = $el.children(),
            $beforeChild = $children.eq(0).children(),
            $afterChild = $children.eq(2).children(),
            $divider = $children.eq(1);
        if (model.type == 'hdiv') {
            if (changes.heightChanged === true) {
                percentHeight($el, model);
            } else {
                fullHeightOrWidthPartition($el, fullWidth);
            };
            adjustHeightWidth($beforeChild, model.upperContent, changes);
            adjustHeightWidth($afterChild, model.lowerContent, changes);
        } else if (model.type == 'vdiv') {
            if (changes.widthChanged === true) {
                percentWidth($el, model);
            } else {
                fullHeightOrWidthPartition($el, fullHeight);
                $divider.find(".appbuilder-v-divider-handle").position({
                    of: $divider
                });
            };
            adjustHeightWidth($beforeChild, model.leftContent, changes);
            adjustHeightWidth($afterChild, model.rightContent, changes);
        }
    }

    // Handle the specifics of the appbuilder panels
    function adjustHeights () {
        var $appbarHeight = $("x-appbar").height();
        $("#appbuilder-outer").height($(window).height() - $appbarHeight);
        fullHeight($("#ozp-builder-panel"));
        fullHeight($("#ozp-builder-layout"));
    };

    // Fit an element into remaining space in its containing element
    //
    // $sideelements is a jQuery array of the elements that should be
    // in line with $this one
    function fitWidth ($this, $sideElements) {
        var width = 0;
        $sideElements.each(function (index, el) {
            width += $(el).outerWidth();
        });
        // Maybe innerWidth needed?
        $this.width($this.parent().width() - width);
    };

    var builderModule = angular.module('AppBuilder', ['ui.bootstrap', 'ngRoute', 'ngResource']);

    function BuilderTopCtrl($scope, $modal) {

        $scope.layout = {};
        $scope.appLookup = {};
        $scope.saveApp = function () {
            console.log("Here's the layout:");
            console.dir($scope.layout);
        };
        $scope.closeBuilder = function () {
            window.location.href = "../";
        };

        //sticking this in here as an alternative to $(document).ready

        adjustHeights();
        var $layout = $("#ozp-builder-layout");
        var $panel = $("#ozp-builder-panel")
        fitWidth($layout, $panel);
        $layout.position({
            my: "left",
            at: "right",
            of: $panel
        });

        $scope.typeAheadSelected = undefined;
        $scope.panelModel = {};

        // Set up layout type selection modal
        $scope.layoutTypes = [
            {
                name: 'fullscreen',
                title: 'Full Screen',
                description: 'Lorem ipsum',
                template: '../partials/guide.html'
            }
            ,{
                name: 'partition',
                title: 'Partition Layout',
                description: 'Fourscore and seven years ago',
                template: '../partials/manual-layout.html'

            }
        ];
        /*

            ,{
                name: 'card',
                title: 'Card Layout',
                description: 'To be, or not to be, that is the question'
            }
            */

        $scope.openModal = function () {

            var modalInstance = $modal.open({
                templateUrl: '../startBuilderModal.html',
                controller: ModalInstanceCtrl,
                resolve: {
                    items: function () {
                        return $scope.layoutTypes;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                alert("New page not chosen");
            });

        }

        $scope.openModal();
    }

    builderModule.controller("BuilderTopCtrl", BuilderTopCtrl);

    var ModalInstanceCtrl  = function ($scope, $modalInstance, items) {

        $scope.layoutTypes = items;
        $scope.selected = {
            item: $scope.layoutTypes[1]
        };

        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };

        setTimeout(function () {
            $('.selected-layout a').focus();
        }, 800);
    };

    builderModule.controller("ModalInstanceCtrl", ModalInstanceCtrl);

    function ComponentListCtrl($http, $scope, App) {

        App.query().$promise.then(function (data) {
            $scope.panelModel.components = data;
            $.each(data, function (index, item) {
                $scope.appLookup[item.name] = item;
            });
            console.log("Here's the lookup");
            console.dir($scope.appLookup);
        });
    };

    builderModule.controller("ComponentListCtrl", ComponentListCtrl);

    function DecksterLayoutCtrl($scope) {

        $scope.decksterPage = "../deckster-sample.html";
        function decksterReady() {
            $("#deck1").deckster({
                animate: {
                    properties: {
                        opacity: ".5"
                    },
                    options: {
                        duration: "slow"
                    }
                },
                "scroll-helper": {
                    "x-position": "middle", // left | middle | right
                    "y-position": "top", // bottom | middle | top
                    "stay-in-view": true // true | false
                }
            });
            $('.deckster-card').droppable({
                accept: ".c-list-item",
                drop: function (event, ui) {
                    var uri = Ozone.appbuilder.selectedComponent.appUrl;
                    $(this).find('.content').html(uri);
                }
            });
        };
        decksterReady();
    };

    builderModule.controller("DecksterLayoutCtrl", DecksterLayoutCtrl);

    function partitionHasComponent($el) {
        var $kid1 = $el.children().eq(0);
        return (typeof $kid1.attr('component-placement') != 'undefined');
    };

    function partitionHasTabset($el) {
        var $kid1 = $el.children().eq(0);
        // Not a great test, but it'll work for now
        return ($kid1.attr('tabset-reorderable') == "true");
    }

    function getDroppable(compile, scope) {
        return {
            accept: ".ozp-appbuilder-divider,.c-list-item",
            drop: function (event, ui) {
                $this = $(this);
                if (partitionHasComponent($this)) {
                    alert("You must delete the component before dragging a new component or divider into this space");
                    return;
                };
                var namespace = $this.data('layout-path'); // e.g., left.upper.right...
                var $el;
                if (ui.helper.hasClass("ozp-layout-divider-h")) {
                    $el = compile('<div horizontalpartition data-layout-path="' + namespace + '">{{testVal}}</div>')(scope);
                } else if (ui.helper.hasClass("ozp-layout-divider-v")) {
                    $el = compile('<div verticalpartition data-layout-path="' + namespace + '">{{testVal}}</div>')(scope);
                } else if (ui.helper.hasClass("c-list-item")) {
                    $el = compile(
                        '<div component-placement ' +
                        'data-layout-path="' + namespace + '" ' +
                        'ng-controller="ComponentPlacementCtrl"></div>')(scope);
                    if (scope.model.displayType == 'tabbed') {
                        var $tabset;
                        if (! partitionHasTabset($this)) {
                            $tabset = compile('<j-tabset tabs-deletable="true" tabset-reorderable="true" ng-init="setInitialTab(\''
                                              + Ozone.appbuilder.selectedComponent.name +'\')"></j-tabset>')(scope);
                            scope.partitionConfigDom = $this.children();
                            scope.partitionConfigDom.parent().droppable("destroy");
                            scope.partitionConfigDom.detach();
                            $this.append($tabset);
                            return;
                        } else {
                            $tabset = $this.children().eq(0);
                            alert("didn't made one");
                        }

                    };
                };
                scope.partitionConfigDom = $this.children().detach();
                $this.append($el);
            }
        };
    }

    /*
     * Takes a function and a timeout, and returns a wrapped version of the
     * function that will only execute once during the timeout period, no
     * matter how often the function is called.
     */
    function debounce(fn, timeout) {
        var execute = true;
        return function () {
            var myThis = this;
            var myArgs = arguments;
            if (execute == false) {
                return;
            };
            execute = false;
            setTimeout(function () {
                execute = true;
                fn.apply(myThis, myArgs);
            }, timeout);
        }
    }

    function GuideViewCtrl($scope, $compile) {
    }

    function setManualLayoutHeight(scope, compile) {
        $("#manual-layout-canvas")
            .height($("#ozp-builder-layout").innerHeight() -
                    $("#app-builder-header").outerHeight());
        var windowHeight = $(window).height();
        $(window).on('resize', debounce(function () {
            var newHeight = $(window).height();
            console.dir(arguments[0]);
            console.log("Here in window.resize; old height is %d, new height is %d", windowHeight, newHeight);
            // The below is commented out since it currently doesn't do
            // anything.  Presumably because the referenced container doesn't
            // get resized.  Which might be easy to fix, but I'm not going to
            // deal with right now.

            //adjustHeightWidth($("#manual-layout-canvas"), $scope.layout, {heightChanged: windowHeight == newHeight});
            windowHeight = newHeight;
        }, 300));
    }

    function ManualLayoutCtrl($scope, $compile) {
    };

    builderModule.controller("ManualLayoutCtrl", ManualLayoutCtrl);

    // Given a rootObj, such as $scope, and a string, such as
    // ".layout.upperContent.leftContent.foo", retrieve the object located
    // within the rootObj at the path indicated by the path string (in this
    // example, $scope.layout.upperContent.leftContent.foo)
    function getObjectFromPath(path, rootObj) {
        rootObj = rootObj || window;
        var pathArr = path.split('.');
        var currObj = rootObj;
        for (var i = 0, len = pathArr.length; i < len; i++) {
            if (pathArr[i])
                currObj = currObj[pathArr[i]];
        };
        return currObj;
    };

    function ComponentPlacementCtrl ($scope) {
    };

    builderModule.controller("ComponentPlacementCtrl", ComponentPlacementCtrl);

    function PartitionConfigCtrl ($scope) {
        $scope.model = {
            displayType: null
        };
    };

    builderModule.controller("PartitionConfigCtrl", PartitionConfigCtrl);

    function TabbedPartitionCtrl($scope) {
        $scope.tabItems = [
            {
                name: "one",
                icon: "icon-one"
            },
            {
                name: "two",
                icon: "icon-zwei"
            }
        ];
        $scope.setInitialTab = function (componentName) {
            var component = $scope.appLookup[componentName];
            $scope.tabItems = [
                {
                    name: componentName,
                    icon: component.icon,
                    junk: 0
                }
            ];
        };
        $scope.deleteItem = function(index) {
            $scope.tabItems.splice(index, 1);
        };
    }

    builderModule.directive('partitionControlPanel', function () {
        return {
            restrict: 'EA',
            templateUrl: '../partitionLayoutControls.html',
            link: function (scope, $el, attrs) {
                var $divider = $(".ozp-appbuilder-divider");
                $divider.draggable({
                    helper: "clone", // do not move the item
                    opacity: 0.3
                });
            }
        }
    }).directive('componentIcon', function() {
        return {
            link: function(scope, $el, attrs) {
                // Set this element up as a jQuery draggable
                $el.draggable({
                    helper: "clone", // do not move the item
                    start: function (event, ui) {
                        // I'm really sorry about this; there has to be a better way
                        Ozone.appbuilder.selectedComponent=scope.component;
                    },
                    opacity: 0.3
                });
                // Can't find this data attribute from the droppable side
                //$el.data("component-uri", scope.component.uri);
            }
        }
    }).directive('appBuilderHeader', function ($compile) {
        return {
            scope: true,
            restrict: 'E',
            templateUrl: 'appBuilderHeaderTmpl',
            link: function (scope, $el, attrs) {
                setManualLayoutHeight(scope, $compile);
            }
        }
    }).directive('horizontalpartition', function ($compile) {
        return {
            templateUrl: '../templates/horizontalPartition.html',
            //replace: true,
            link: function(scope, $el, attrs) {
                console.log('horizontalPartition');
                var parentPath = attrs.layoutPath;
                var submodel = getObjectFromPath(parentPath, scope.layout);
                fullHeight($el);
                submodel.type = 'hdiv';
                submodel.upperHeightPct = 50;
                submodel.upperContent = {};
                submodel.lowerContent = {};
                $el.find('.appbuilder-upper-partition').data('layout-path', parentPath + '.upperContent');
                $el.find('.appbuilder-lower-partition').data('layout-path', parentPath + '.lowerContent');
                percentHeight($el, submodel);

                //$el.find('.appbuilder-h-partition').droppable(getDroppable($compile, scope));
                $el.parent().droppable("destroy");
                $el.find('.appbuilder-h-divider')
                    .draggable({
                        handle: '.appbuilder-h-divider-handle',
                        containment: "parent",
                        stop: function (event, ui) {
                            console.log("position from jQuery.position");
                            console.dir(ui.helper.position());
                            console.log("Here's scope:");
                            console.dir(scope);
                            setHeightDivisions($el, ui.helper.position().top, submodel);
                            adjustHeightWidth($el.children().eq(0).children(), submodel.upperContent, {heightChanged: true});
                            adjustHeightWidth($el.children().eq(2).children(), submodel.lowerContent, {heightChanged: true});
                        },
                        junk: 0
                    });
            }
        };
    }).directive('verticalpartition', function ($compile) {
        return {
            templateUrl: '../templates/verticalPartition.html',
            //replace: true,
            link: function(scope, $el, attrs) {
                console.log('verticalPartition');
                var parentPath = attrs.layoutPath;
                var submodel = getObjectFromPath(parentPath, scope.layout);
                fullHeight($el);
                submodel.type = 'vdiv';
                submodel.leftWidthPct = 50;
                submodel.leftContent = {};
                submodel.rightContent = {};
                $el.find('.appbuilder-left-partition').data('layout-path', parentPath + '.leftContent');
                $el.find('.appbuilder-right-partition').data('layout-path', parentPath + '.rightContent');
                percentWidth($el, submodel);

                //$el.find('.appbuilder-v-partition').droppable(getDroppable($compile, scope));
                $el.parent().droppable("destroy");
                $el.find('.appbuilder-v-divider')
                    .draggable({
                        handle: '.appbuilder-v-divider-handle',
                        containment: "parent",
                        stop: function (event, ui) {
                            console.log("position from jQuery.position");
                            console.dir(ui.helper.position());
                            console.log("Here's scope:");
                            console.dir(scope);
                            fullWidth($el);
                            setWidthDivisions($el, ui.helper.position().left, submodel);
                            adjustHeightWidth($el.children().eq(0).children(), submodel.leftContent, {widthChanged: true});
                            adjustHeightWidth($el.children().eq(2).children(), submodel.rightContent, {widthChanged: true});
                        },
                        junk: 0
                    });
            }
        };
    }).directive('partitionConfig', function ($compile) {
        return {
            templateUrl: '../templates/partitionConfig.html',
            //replace: true,
            scope: true,
            controller: PartitionConfigCtrl,
            link: function(scope, $el, attrs) {
                setTimeout(function () {
                    var parentPath = $el.data('layout-path');
                    var submodel = getObjectFromPath(parentPath, scope.layout);
                    console.log("parentPath is " + parentPath);
                }, 100);
                //fullHeight($el);

                // Following conditional addresses whether this directive was
                // run before the horizonta/verticalpartition directive.
                // Which, in turn, depends on whether we used template or
                // templateUrl in this directive
                if (! $el.data('layout-path')) {
                    $el.data('layout-path', "");
                };
                //$el.find('.appbuilder-left-partition').attr('layout-path', parentPath + '.leftContent');

                $el.droppable(getDroppable($compile, scope));
                //$el.parent().droppable("disable");
            }
        };
    }).directive('componentPlacement', function ($compile) {
        return {
            scope: true,
            templateUrl: '../templates/componentPlacement.html',
            link: function(scope, $el, attrs) {
                var parentPath = $el.data('layout-path');
                scope.component = Ozone.appbuilder.selectedComponent;
                var myLayoutNode = getObjectFromPath(parentPath, scope.layout);
                myLayoutNode.componentId = scope.component.name;
                scope.deleteComponent = function () {
                    console.log("deleting component %s", scope.component.name);
                    console.dir($el);
                    delete scope.component;
                    delete myLayoutNode.componentId;
                    var $parent = $el.parent();
                    $el.remove();
                    $parent.append(scope.partitionConfigDom);
                };
                console.dir(scope);
            }
        }
    }).directive('jTabset', function () {
        return {
            restrict: 'EA',
            controller: TabbedPartitionCtrl,
            templateUrl: 'jtabset.html',
            replace: true,
            scope: true,
            link: function (scope, $el, attrs) {
                console.log("in the link function");
                scope.tabsetId = tabsetCounter++;
                if (attrs['tabsDeletable'] == "true") {
                    scope.tabsDeletable = true;
                };
                // There must be a better way than setTimeout
                setTimeout(function () {
                    var $tabs = $el.tabs();
                    function resetIndexes() {
                        $tabs.find(".ui-tabs-nav > li").each(function (index, item) {
                            $(item).data('orig-index', index);
                        });
                    };
                    fullHeight($el);
                    var divInnerHeight = $el.height();
                    var tabHandleHeight = $el.find(".ui-tabs-nav").outerHeight();
                    var tabContentHeight = divInnerHeight - tabHandleHeight;
                    $tabs.droppable({
                        accept: ".c-list-item",
                        drop: function (event, ui) {
                            var componentName = Ozone.appbuilder.selectedComponent.name;
                            $this = $(this);
                            console.log("Dropping %s into tabset %s", componentName, scope.tabsetId);
                            var namespace = $this.data('layout-path'); // e.g., left.upper.right...
                            scope.$apply(function () {
                                console.log("pushing %s", componentName);
                                scope.tabItems.push({
                                    name: componentName,
                                    icon: scope.appLookup[componentName].icon
                                });
                            });

                            //$tabs.tabs("refresh");
                            var $tabContent = $el.children("div");
                            $tabContent.outerHeight(tabContentHeight);
                        }
                    });
                    var $tabContent = $el.children("div");
                    $tabContent.outerHeight(tabContentHeight);
                    $tabs.find(".ui-tabs-nav").sortable({
                        axis: "x",
                        stop: function() {
                            var newtabs = [];
                            $tabs.find(".ui-tabs-nav > li").each(function () {
                                var index = $(this).data('orig-index');
                                console.log("pushing %s", $(this).data('component-name'));
                                newtabs.push(scope.tabItems[index]);
                            });
                            scope.$apply(function (newval) {
                                scope.tabItems = newtabs;
                            });
                        }
                    });
                    scope.$watch('tabItems', function (newval, oldval) {
                        console.log("tabItems changed. was");
                        console.dir(oldval);
                        console.log("now");
                        console.dir(newval);
                        // http://stackoverflow.com/questions/11125078/is-there-a-post-render-callback-for-angular-js-directive
                        setTimeout(function () {
                            $tabs.tabs("refresh");
                            resetIndexes();
                            console.log("refreshed");
                        }, 10);
                    }, true);
                }, 50);
            }
        }
    }).config(function($routeProvider) {
    });
})();
