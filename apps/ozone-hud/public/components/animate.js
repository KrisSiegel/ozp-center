var animate = (function (options, callback, context) {

	var opts = { };

	opts.element = (options.element !== undefined) ? opts.element: document.getElementById(options.elementId);
	opts.unit = options.unit;
	opts.style = options.style;
	opts.val = ((options.startValue || Number(opts.element.style[opts.style].match(/\d/g) || [0])[0]) || 0);
	opts.target = options.targetValue;
	opts.rate = options.rate || 100;
	opts.direction = (opts.target < opts.val) ? -1 : 1;
	opts.step = options.step || 1;
	opts.timeout = undefined;

	var original = Ozone.extend(opts, { });

	var moveIt = function () {
		if (opts.target === opts.val) {
			clearTimeout(opts.timeout);
			callback.apply((context || this), []);
			return;
		} else {
			opts.val = (opts.val + (opts.step * opts.direction));
			opts.element.style[opts.style] = (opts.val + opts.unit);
			opts.timeout = setTimeout(moveIt, opts.rate);
		}
	};

	return {
		getOptions: function () {
			return opts;
		},
		move: function (rate) {
			opts.rate = rate || opts.rate;
			moveIt();
			return this;
		},
		cancel: function () {
			clearTimeout(opts.timeout);
			opts = Ozone.extend(original, opts);
			opts.element.style[opts.style] = (opts.val + opts.unit);
		}
	};
});