var xtagger = (function () {
	var executionQueue = [], isReady = false, isImportLoaded = false, isWebComponentReady = false;
	var componentImport = null;
	var documentTemplates = null;
	function execute (callback, context) {
		callback.apply((context || this), []);
	}

	function executeQueue() {
		while (executionQueue.length > 0) {
			var item = executionQueue.shift();
			execute(item.callback, item.context);
		}
	}

	function seeIfWeCanExecuteQueue() {
		if (isImportLoaded === true && isWebComponentReady === true && typeof xtag !== "undefined") {
			isReady = true;
			executeQueue();
		}
	}

	function HTMLImportsLoadedListener() {
		isImportLoaded = true;
    	seeIfWeCanExecuteQueue();
	}

    document.addEventListener('HTMLImportsLoaded', HTMLImportsLoadedListener, false);

    function WebComponentsReady() {
    	isWebComponentReady = true;
    	seeIfWeCanExecuteQueue();
    }

    document.addEventListener('WebComponentsReady', WebComponentsReady, false);

    function hashchangeFired() {
    	pubsub.publish("navigate", window.location.hash);
    }

	function appendTemplates() {
		var doc = null,
		    templates = null,
		    second_lvl_templates = null;
		if (documentTemplates == null) {
			documentTemplates = document.createDocumentFragment();
		}
		var headTags = (document.getElementsByTagName("head").length > 0) ? document.getElementsByTagName("head")[0].children : [];
		for (var i = 0; i < headTags.length; ++i) {
			var rel = headTags[i].getAttribute("rel");
			var href = headTags[i].getAttribute("href");

			if (rel === "import") {
				doc = headTags[i].import.content;
				templates = doc.getElementsByTagName('template');
				for (var j = 0; j < templates.length; j++) {
					documentTemplates.appendChild(templates[j].cloneNode(true));
					second_lvl_templates = templates[j].content;
					if (second_lvl_templates != null) {
						for (var k = 0; k < second_lvl_templates.length; k++) {
							documentTemplates.appendChild(second_lvl_templates[k].cloneNode(true));
						}
					}
				};
			}
		}
		document.body.appendChild(documentTemplates);
	};
		
    window.addEventListener("hashchange", hashchangeFired, false);
   	pubsub.publish("navigate", window.location.hash);

	return {
		ready: function (callback, context) {
			if (isReady) {
				execute(callback, context);
			} else {
				executionQueue.push({
					callback: callback,
					context: context
				});
			}
		},
		getImport: function (path) {
			// GET ALL THE THINGS IN THE HEAD TAG!!!!!
			var headTags = (document.getElementsByTagName("head").length > 0) ? document.getElementsByTagName("head")[0].children : [];
			for (var i = 0; i < headTags.length; ++i) {
				var rel = headTags[i].getAttribute("rel");
				var href = headTags[i].getAttribute("href");

				if (rel === "import") {
					if (href.indexOf(path) >= 0) {
						return headTags[i].import.content.documentElement;
					}
					if (componentImport == null && href.indexOf("hud-components.html") >= 0) {
						componentImport = headTags[i].import.content.documentElement;
					}
				}
			}
			var template = componentImport.getElementsByClassName(path + '-tpl')[0];
			var docEl = template.content;
			return docEl;
				
		}
	};
}());
