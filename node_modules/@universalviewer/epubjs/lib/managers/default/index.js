"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventEmitter = require("event-emitter");

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _core = require("../../utils/core");

var _mapping = require("../../mapping");

var _mapping2 = _interopRequireDefault(_mapping);

var _queue = require("../../utils/queue");

var _queue2 = _interopRequireDefault(_queue);

var _stage = require("../helpers/stage");

var _stage2 = _interopRequireDefault(_stage);

var _views = require("../helpers/views");

var _views2 = _interopRequireDefault(_views);

var _constants = require("../../utils/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DefaultViewManager = function () {
	function DefaultViewManager(options) {
		_classCallCheck(this, DefaultViewManager);

		this.name = "default";
		this.optsSettings = options.settings;
		this.View = options.view;
		this.request = options.request;
		this.renditionQueue = options.queue;
		this.q = new _queue2.default(this);

		this.settings = (0, _core.extend)(this.settings || {}, {
			infinite: true,
			hidden: false,
			width: undefined,
			height: undefined,
			axis: undefined,
			flow: "scrolled",
			ignoreClass: "",
			fullsize: undefined
		});

		(0, _core.extend)(this.settings, options.settings || {});

		this.viewSettings = {
			ignoreClass: this.settings.ignoreClass,
			axis: this.settings.axis,
			flow: this.settings.flow,
			layout: this.layout,
			method: this.settings.method, // srcdoc, blobUrl, write
			width: 0,
			height: 0,
			forceEvenPages: true
		};

		this.rendered = false;
	}

	_createClass(DefaultViewManager, [{
		key: "render",
		value: function render(element, size) {
			var tag = element.tagName;

			if (typeof this.settings.fullsize === "undefined" && tag && (tag.toLowerCase() == "body" || tag.toLowerCase() == "html")) {
				this.settings.fullsize = true;
			}

			if (this.settings.fullsize) {
				this.settings.overflow = "visible";
				this.overflow = this.settings.overflow;
			}

			this.settings.size = size;

			// Save the stage
			this.stage = new _stage2.default({
				width: size.width,
				height: size.height,
				overflow: this.overflow,
				hidden: this.settings.hidden,
				axis: this.settings.axis,
				fullsize: this.settings.fullsize,
				direction: this.settings.direction
			});

			this.stage.attachTo(element);

			// Get this stage container div
			this.container = this.stage.getContainer();

			// Views array methods
			this.views = new _views2.default(this.container);

			// Calculate Stage Size
			this._bounds = this.bounds();
			this._stageSize = this.stage.size();

			// Set the dimensions for views
			this.viewSettings.width = this._stageSize.width;
			this.viewSettings.height = this._stageSize.height;

			// Function to handle a resize event.
			// Will only attach if width and height are both fixed.
			this.stage.onResize(this.onResized.bind(this));

			this.stage.onOrientationChange(this.onOrientationChange.bind(this));

			// Add Event Listeners
			this.addEventListeners();

			// Add Layout method
			// this.applyLayoutMethod();
			if (this.layout) {
				this.updateLayout();
			}

			this.rendered = true;
		}
	}, {
		key: "addEventListeners",
		value: function addEventListeners() {
			var scroller;

			window.addEventListener("unload", function (e) {
				this.destroy();
			}.bind(this));

			if (!this.settings.fullsize) {
				scroller = this.container;
			} else {
				scroller = window;
			}

			this._onScroll = this.onScroll.bind(this);
			scroller.addEventListener("scroll", this._onScroll);
		}
	}, {
		key: "removeEventListeners",
		value: function removeEventListeners() {
			var scroller;

			if (!this.settings.fullsize) {
				scroller = this.container;
			} else {
				scroller = window;
			}

			scroller.removeEventListener("scroll", this._onScroll);
			this._onScroll = undefined;
		}
	}, {
		key: "destroy",
		value: function destroy() {
			clearTimeout(this.orientationTimeout);
			clearTimeout(this.resizeTimeout);
			clearTimeout(this.afterScrolled);

			this.clear();

			this.removeEventListeners();

			this.stage.destroy();

			this.rendered = false;

			/*
   		clearTimeout(this.trimTimeout);
   	if(this.settings.hidden) {
   		this.element.removeChild(this.wrapper);
   	} else {
   		this.element.removeChild(this.container);
   	}
   */
		}
	}, {
		key: "onOrientationChange",
		value: function onOrientationChange(e) {
			var _window = window,
			    orientation = _window.orientation;


			if (this.optsSettings.resizeOnOrientationChange) {
				this.resize();
			}

			// Per ampproject:
			// In IOS 10.3, the measured size of an element is incorrect if the
			// element size depends on window size directly and the measurement
			// happens in window.resize event. Adding a timeout for correct
			// measurement. See https://github.com/ampproject/amphtml/issues/8479
			clearTimeout(this.orientationTimeout);
			this.orientationTimeout = setTimeout(function () {
				this.orientationTimeout = undefined;

				if (this.optsSettings.resizeOnOrientationChange) {
					this.resize();
				}

				this.emit(_constants.EVENTS.MANAGERS.ORIENTATION_CHANGE, orientation);
			}.bind(this), 500);
		}
	}, {
		key: "onResized",
		value: function onResized(e) {
			this.resize();
		}
	}, {
		key: "resize",
		value: function resize(width, height, epubcfi) {
			var stageSize = this.stage.size(width, height);

			// For Safari, wait for orientation to catch up
			// if the window is a square
			this.winBounds = (0, _core.windowBounds)();
			if (this.orientationTimeout && this.winBounds.width === this.winBounds.height) {
				// reset the stage size for next resize
				this._stageSize = undefined;
				return;
			}

			if (this._stageSize && this._stageSize.width === stageSize.width && this._stageSize.height === stageSize.height) {
				// Size is the same, no need to resize
				return;
			}

			this._stageSize = stageSize;

			this._bounds = this.bounds();

			// Clear current views
			this.clear();

			// Update for new views
			this.viewSettings.width = this._stageSize.width;
			this.viewSettings.height = this._stageSize.height;

			this.updateLayout();

			this.emit(_constants.EVENTS.MANAGERS.RESIZED, {
				width: this._stageSize.width,
				height: this._stageSize.height
			}, epubcfi);
		}
	}, {
		key: "createView",
		value: function createView(section) {
			return new this.View(section, this.viewSettings);
		}
	}, {
		key: "display",
		value: function display(section, target) {

			var displaying = new _core.defer();
			var displayed = displaying.promise;

			// Check if moving to target is needed
			if (target === section.href || (0, _core.isNumber)(target)) {
				target = undefined;
			}

			// Check to make sure the section we want isn't already shown
			var visible = this.views.find(section);

			// View is already shown, just move to correct location in view
			if (visible && section) {
				var offset = visible.offset();

				if (this.settings.direction === "ltr") {
					this.scrollTo(offset.left, offset.top, true);
				} else {
					var width = visible.width();
					this.scrollTo(offset.left + width, offset.top, true);
				}

				if (target) {
					var _offset = visible.locationOf(target);
					this.moveTo(_offset);
				}

				displaying.resolve();
				return displayed;
			}

			// Hide all current views
			this.clear();

			this.add(section).then(function (view) {

				// Move to correct place within the section, if needed
				if (target) {
					var _offset2 = view.locationOf(target);
					this.moveTo(_offset2);
				}
			}.bind(this), function (err) {
				displaying.reject(err);
			}).then(function () {
				var next;
				if (this.layout.name === "pre-paginated" && this.layout.divisor > 1 && section.index > 0) {
					// First page (cover) should stand alone for pre-paginated books
					next = section.next();
					if (next) {
						return this.add(next);
					}
				}
			}.bind(this)).then(function () {

				this.views.show();

				displaying.resolve();
			}.bind(this));
			// .then(function(){
			// 	return this.hooks.display.trigger(view);
			// }.bind(this))
			// .then(function(){
			// 	this.views.show();
			// }.bind(this));
			return displayed;
		}
	}, {
		key: "afterDisplayed",
		value: function afterDisplayed(view) {
			this.emit(_constants.EVENTS.MANAGERS.ADDED, view);
		}
	}, {
		key: "afterResized",
		value: function afterResized(view) {
			this.emit(_constants.EVENTS.MANAGERS.RESIZE, view.section);
		}
	}, {
		key: "moveTo",
		value: function moveTo(offset) {
			var distX = 0,
			    distY = 0;

			if (!this.isPaginated) {
				distY = offset.top;
			} else {
				distX = Math.floor(offset.left / this.layout.delta) * this.layout.delta;

				if (distX + this.layout.delta > this.container.scrollWidth) {
					distX = this.container.scrollWidth - this.layout.delta;
				}
			}
			this.scrollTo(distX, distY, true);
		}
	}, {
		key: "add",
		value: function add(section) {
			var _this = this;

			var view = this.createView(section);

			this.views.append(view);

			// view.on(EVENTS.VIEWS.SHOWN, this.afterDisplayed.bind(this));
			view.onDisplayed = this.afterDisplayed.bind(this);
			view.onResize = this.afterResized.bind(this);

			view.on(_constants.EVENTS.VIEWS.AXIS, function (axis) {
				_this.updateAxis(axis);
			});

			return view.display(this.request);
		}
	}, {
		key: "append",
		value: function append(section) {
			var _this2 = this;

			var view = this.createView(section);
			this.views.append(view);

			view.onDisplayed = this.afterDisplayed.bind(this);
			view.onResize = this.afterResized.bind(this);

			view.on(_constants.EVENTS.VIEWS.AXIS, function (axis) {
				_this2.updateAxis(axis);
			});

			return view.display(this.request);
		}
	}, {
		key: "prepend",
		value: function prepend(section) {
			var _this3 = this;

			var view = this.createView(section);

			view.on(_constants.EVENTS.VIEWS.RESIZED, function (bounds) {
				_this3.counter(bounds);
			});

			this.views.prepend(view);

			view.onDisplayed = this.afterDisplayed.bind(this);
			view.onResize = this.afterResized.bind(this);

			view.on(_constants.EVENTS.VIEWS.AXIS, function (axis) {
				_this3.updateAxis(axis);
			});

			return view.display(this.request);
		}
	}, {
		key: "counter",
		value: function counter(bounds) {
			if (this.settings.axis === "vertical") {
				this.scrollBy(0, bounds.heightDelta, true);
			} else {
				this.scrollBy(bounds.widthDelta, 0, true);
			}
		}

		// resizeView(view) {
		//
		// 	if(this.settings.globalLayoutProperties.layout === "pre-paginated") {
		// 		view.lock("both", this.bounds.width, this.bounds.height);
		// 	} else {
		// 		view.lock("width", this.bounds.width, this.bounds.height);
		// 	}
		//
		// };

	}, {
		key: "next",
		value: function next() {
			var next;
			var left;

			var dir = this.settings.direction;

			if (!this.views.length) return;

			if (this.isPaginated && this.settings.axis === "horizontal" && (!dir || dir === "ltr")) {

				this.scrollLeft = this.container.scrollLeft;

				left = this.container.scrollLeft + this.container.offsetWidth + this.layout.delta;

				if (left <= this.container.scrollWidth) {
					this.scrollBy(this.layout.delta, 0, true);
				} else {
					next = this.views.last().section.next();
				}
			} else if (this.isPaginated && this.settings.axis === "horizontal" && dir === "rtl") {

				this.scrollLeft = this.container.scrollLeft;

				left = this.container.scrollLeft;

				if (left > 0) {
					this.scrollBy(this.layout.delta, 0, true);
				} else {
					next = this.views.last().section.next();
				}
			} else if (this.isPaginated && this.settings.axis === "vertical") {

				this.scrollTop = this.container.scrollTop;

				var top = this.container.scrollTop + this.container.offsetHeight;

				if (top < this.container.scrollHeight) {
					this.scrollBy(0, this.layout.height, true);
				} else {
					next = this.views.last().section.next();
				}
			} else {
				next = this.views.last().section.next();
			}

			if (next) {
				this.clear();

				return this.append(next).then(function () {
					var right;
					if (this.layout.name === "pre-paginated" && this.layout.divisor > 1) {
						right = next.next();
						if (right) {
							return this.append(right);
						}
					}
				}.bind(this), function (err) {
					return err;
				}).then(function () {
					this.views.show();
				}.bind(this));
			}
		}
	}, {
		key: "prev",
		value: function prev() {
			var prev;
			var left;
			var dir = this.settings.direction;

			if (!this.views.length) return;

			if (this.isPaginated && this.settings.axis === "horizontal" && (!dir || dir === "ltr")) {

				this.scrollLeft = this.container.scrollLeft;

				left = this.container.scrollLeft;

				if (left > 0) {
					this.scrollBy(-this.layout.delta, 0, true);
				} else {
					prev = this.views.first().section.prev();
				}
			} else if (this.isPaginated && this.settings.axis === "horizontal" && dir === "rtl") {

				this.scrollLeft = this.container.scrollLeft;

				left = this.container.scrollLeft + this.container.offsetWidth + this.layout.delta;

				if (left <= this.container.scrollWidth) {
					this.scrollBy(-this.layout.delta, 0, true);
				} else {
					prev = this.views.first().section.prev();
				}
			} else if (this.isPaginated && this.settings.axis === "vertical") {

				this.scrollTop = this.container.scrollTop;

				var top = this.container.scrollTop;

				if (top > 0) {
					this.scrollBy(0, -this.layout.height, true);
				} else {
					prev = this.views.first().section.prev();
				}
			} else {

				prev = this.views.first().section.prev();
			}

			if (prev) {
				this.clear();

				return this.prepend(prev).then(function () {
					var left;
					if (this.layout.name === "pre-paginated" && this.layout.divisor > 1) {
						left = prev.prev();
						if (left) {
							return this.prepend(left);
						}
					}
				}.bind(this), function (err) {
					return err;
				}).then(function () {
					if (this.isPaginated && this.settings.axis === "horizontal") {
						if (this.settings.direction === "rtl") {
							this.scrollTo(0, 0, true);
						} else {
							this.scrollTo(this.container.scrollWidth - this.layout.delta, 0, true);
						}
					}
					this.views.show();
				}.bind(this));
			}
		}
	}, {
		key: "current",
		value: function current() {
			var visible = this.visible();
			if (visible.length) {
				// Current is the last visible view
				return visible[visible.length - 1];
			}
			return null;
		}
	}, {
		key: "clear",
		value: function clear() {

			// this.q.clear();

			if (this.views) {
				this.views.hide();
				this.scrollTo(0, 0, true);
				this.views.clear();
			}
		}
	}, {
		key: "currentLocation",
		value: function currentLocation() {

			if (this.settings.axis === "vertical") {
				this.location = this.scrolledLocation();
			} else {
				this.location = this.paginatedLocation();
			}
			return this.location;
		}
	}, {
		key: "scrolledLocation",
		value: function scrolledLocation() {
			var _this4 = this;

			var visible = this.visible();
			var container = this.container.getBoundingClientRect();
			var pageHeight = container.height < window.innerHeight ? container.height : window.innerHeight;

			var offset = 0;
			var used = 0;

			if (this.settings.fullsize) {
				offset = window.scrollY;
			}

			var sections = visible.map(function (view) {
				var _view$section = view.section,
				    index = _view$section.index,
				    href = _view$section.href;

				var position = view.position();
				var height = view.height();

				var startPos = offset + container.top - position.top + used;
				var endPos = startPos + pageHeight - used;
				if (endPos > height) {
					endPos = height;
					used = endPos - startPos;
				}

				var totalPages = _this4.layout.count(height, pageHeight).pages;

				var currPage = Math.ceil(startPos / pageHeight);
				var pages = [];
				var endPage = Math.ceil(endPos / pageHeight);

				pages = [];
				for (var i = currPage; i <= endPage; i++) {
					var pg = i + 1;
					pages.push(pg);
				}

				var mapping = _this4.mapping.page(view.contents, view.section.cfiBase, startPos, endPos);

				return {
					index: index,
					href: href,
					pages: pages,
					totalPages: totalPages,
					mapping: mapping
				};
			});

			return sections;
		}
	}, {
		key: "paginatedLocation",
		value: function paginatedLocation() {
			var _this5 = this;

			var visible = this.visible();
			var container = this.container.getBoundingClientRect();

			var left = 0;
			var used = 0;

			if (this.settings.fullsize) {
				left = window.scrollX;
			}

			var sections = visible.map(function (view) {
				var _view$section2 = view.section,
				    index = _view$section2.index,
				    href = _view$section2.href;

				var offset = view.offset().left;
				var position = view.position().left;
				var width = view.width();

				// Find mapping
				var start = left + container.left - position + used;
				var end = start + _this5.layout.width - used;

				var mapping = _this5.mapping.page(view.contents, view.section.cfiBase, start, end);

				// Find displayed pages
				//console.log("pre", end, offset + width);
				// if (end > offset + width) {
				// 	end = offset + width;
				// 	used = this.layout.pageWidth;
				// }
				// console.log("post", end);

				var totalPages = _this5.layout.count(width).pages;
				var startPage = Math.floor(start / _this5.layout.pageWidth);
				var pages = [];
				var endPage = Math.floor(end / _this5.layout.pageWidth);

				// start page should not be negative
				if (startPage < 0) {
					startPage = 0;
					endPage = endPage + 1;
				}

				// Reverse page counts for rtl
				if (_this5.settings.direction === "rtl") {
					var tempStartPage = startPage;
					startPage = totalPages - endPage;
					endPage = totalPages - tempStartPage;
				}

				for (var i = startPage + 1; i <= endPage; i++) {
					var pg = i;
					pages.push(pg);
				}

				return {
					index: index,
					href: href,
					pages: pages,
					totalPages: totalPages,
					mapping: mapping
				};
			});

			return sections;
		}
	}, {
		key: "isVisible",
		value: function isVisible(view, offsetPrev, offsetNext, _container) {
			var position = view.position();
			var container = _container || this.bounds();

			if (this.settings.axis === "horizontal" && position.right > container.left - offsetPrev && position.left < container.right + offsetNext) {

				return true;
			} else if (this.settings.axis === "vertical" && position.bottom > container.top - offsetPrev && position.top < container.bottom + offsetNext) {

				return true;
			}

			return false;
		}
	}, {
		key: "visible",
		value: function visible() {
			var container = this.bounds();
			var views = this.views.displayed();
			var viewsLength = views.length;
			var visible = [];
			var isVisible;
			var view;

			for (var i = 0; i < viewsLength; i++) {
				view = views[i];
				isVisible = this.isVisible(view, 0, 0, container);

				if (isVisible === true) {
					visible.push(view);
				}
			}
			return visible;
		}
	}, {
		key: "scrollBy",
		value: function scrollBy(x, y, silent) {
			var dir = this.settings.direction === "rtl" ? -1 : 1;

			if (silent) {
				this.ignore = true;
			}

			if (!this.settings.fullsize) {
				if (x) this.container.scrollLeft += x * dir;
				if (y) this.container.scrollTop += y;
			} else {
				window.scrollBy(x * dir, y * dir);
			}
			this.scrolled = true;
		}
	}, {
		key: "scrollTo",
		value: function scrollTo(x, y, silent) {
			if (silent) {
				this.ignore = true;
			}

			if (!this.settings.fullsize) {
				this.container.scrollLeft = x;
				this.container.scrollTop = y;
			} else {
				window.scrollTo(x, y);
			}
			this.scrolled = true;
		}
	}, {
		key: "onScroll",
		value: function onScroll() {
			var scrollTop = void 0;
			var scrollLeft = void 0;

			if (!this.settings.fullsize) {
				scrollTop = this.container.scrollTop;
				scrollLeft = this.container.scrollLeft;
			} else {
				scrollTop = window.scrollY;
				scrollLeft = window.scrollX;
			}

			this.scrollTop = scrollTop;
			this.scrollLeft = scrollLeft;

			if (!this.ignore) {
				this.emit(_constants.EVENTS.MANAGERS.SCROLL, {
					top: scrollTop,
					left: scrollLeft
				});

				clearTimeout(this.afterScrolled);
				this.afterScrolled = setTimeout(function () {
					this.emit(_constants.EVENTS.MANAGERS.SCROLLED, {
						top: this.scrollTop,
						left: this.scrollLeft
					});
				}.bind(this), 20);
			} else {
				this.ignore = false;
			}
		}
	}, {
		key: "bounds",
		value: function bounds() {
			var bounds;

			bounds = this.stage.bounds();

			return bounds;
		}
	}, {
		key: "applyLayout",
		value: function applyLayout(layout) {

			this.layout = layout;
			this.updateLayout();
			// this.manager.layout(this.layout.format);
		}
	}, {
		key: "updateLayout",
		value: function updateLayout() {

			if (!this.stage) {
				return;
			}

			this._stageSize = this.stage.size();

			if (!this.isPaginated) {
				this.layout.calculate(this._stageSize.width, this._stageSize.height);
			} else {
				this.layout.calculate(this._stageSize.width, this._stageSize.height, this.settings.gap);

				// Set the look ahead offset for what is visible
				this.settings.offset = this.layout.delta;

				// this.stage.addStyleRules("iframe", [{"margin-right" : this.layout.gap + "px"}]);
			}

			// Set the dimensions for views
			this.viewSettings.width = this.layout.width;
			this.viewSettings.height = this.layout.height;

			this.setLayout(this.layout);
		}
	}, {
		key: "setLayout",
		value: function setLayout(layout) {

			this.viewSettings.layout = layout;

			this.mapping = new _mapping2.default(layout.props, this.settings.direction, this.settings.axis);

			if (this.views) {

				this.views.forEach(function (view) {
					if (view) {
						view.setLayout(layout);
					}
				});
			}
		}
	}, {
		key: "updateAxis",
		value: function updateAxis(axis, forceUpdate) {

			if (!this.isPaginated) {
				axis = "vertical";
			}

			if (!forceUpdate && axis === this.settings.axis) {
				return;
			}

			this.settings.axis = axis;

			this.stage && this.stage.axis(axis);

			this.viewSettings.axis = axis;

			if (this.mapping) {
				this.mapping = new _mapping2.default(this.layout.props, this.settings.direction, this.settings.axis);
			}

			if (this.layout) {
				if (axis === "vertical") {
					this.layout.spread("none");
				} else {
					this.layout.spread(this.layout.settings.spread);
				}
			}
		}
	}, {
		key: "updateFlow",
		value: function updateFlow(flow) {
			var defaultScrolledOverflow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "auto";

			var isPaginated = flow === "paginated" || flow === "auto";

			this.isPaginated = isPaginated;

			if (flow === "scrolled-doc" || flow === "scrolled-continuous" || flow === "scrolled") {
				this.updateAxis("vertical");
			} else {
				this.updateAxis("horizontal");
			}

			this.viewSettings.flow = flow;

			if (!this.settings.overflow) {
				this.overflow = isPaginated ? "hidden" : defaultScrolledOverflow;
			} else {
				this.overflow = this.settings.overflow;
			}

			this.stage && this.stage.overflow(this.overflow);

			this.updateLayout();
		}
	}, {
		key: "getContents",
		value: function getContents() {
			var contents = [];
			if (!this.views) {
				return contents;
			}
			this.views.forEach(function (view) {
				var viewContents = view && view.contents;
				if (viewContents) {
					contents.push(viewContents);
				}
			});
			return contents;
		}
	}, {
		key: "direction",
		value: function direction() {
			var dir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "ltr";

			this.settings.direction = dir;

			this.stage && this.stage.direction(dir);

			this.viewSettings.direction = dir;

			this.updateLayout();
		}
	}, {
		key: "isRendered",
		value: function isRendered() {
			return this.rendered;
		}
	}]);

	return DefaultViewManager;
}();

//-- Enable binding events to Manager


(0, _eventEmitter2.default)(DefaultViewManager.prototype);

exports.default = DefaultViewManager;
module.exports = exports["default"];