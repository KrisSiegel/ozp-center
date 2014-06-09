Ozone.extend(function () {
    return {
        utils: {
            dom: {
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