/**
    @module Ozone
    @class Ozone
*/
Ozone.extend(function () {
    return {
        utils: {
            dom: {
                /**
                    @method utils.dom.removeAllChildrenNodes
                    @param {HTMLElement} element the parent where all children linked to must be removed
                */
                removeAllChildrenNodes: function (element) {
                    if (!Ozone.utils.isUndefinedOrNull(element)) {
                        while (element.firstChild) {
                            element.removeChild(element.firstChild);
                        }
                    }
                }
            }
        }
    };
}());
