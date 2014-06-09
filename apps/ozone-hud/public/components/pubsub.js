var pubsub = (function () {
	var subscribers = { };
	
	return {
		subscribe: function (topic, callback, context) {
			if (subscribers[topic] === undefined) {
				subscribers[topic] = [];
			}
			subscribers[topic].push({
				callback: callback,
				context: (context || this)
			});
		},
		publish: function (topic, payload) {
			if (subscribers[topic] !== undefined && subscribers[topic].length > 0) {
				for (var i = 0; i < subscribers[topic].length; ++i) {
					(function (callback, context, data) {
						setTimeout(function () {
							callback.apply(context, [data]);
						}, 0);
					}(subscribers[topic][i].callback, subscribers[topic][i].context, payload));
				}
			}
		}
	};
}());