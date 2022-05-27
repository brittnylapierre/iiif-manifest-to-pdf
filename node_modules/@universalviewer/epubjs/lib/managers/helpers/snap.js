"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require("../../utils/core");

var _constants = require("../../utils/constants");

var _eventEmitter = require("event-emitter");

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// easing equations from https://github.com/danro/easing-js/blob/master/easing.js
var PI_D2 = Math.PI / 2;
var EASING_EQUATIONS = {
	easeOutSine: function easeOutSine(pos) {
		return Math.sin(pos * PI_D2);
	},
	easeInOutSine: function easeInOutSine(pos) {
		return -0.5 * (Math.cos(Math.PI * pos) - 1);
	},
	easeInOutQuint: function easeInOutQuint(pos) {
		if ((pos /= 0.5) < 1) {
			return 0.5 * Math.pow(pos, 5);
		}
		return 0.5 * (Math.pow(pos - 2, 5) + 2);
	},
	easeInCubic: function easeInCubic(pos) {
		return Math.pow(pos, 3);
	}
};

var Snap = function () {
	function Snap(manager, options) {
		_classCallCheck(this, Snap);

		this.settings = (0, _core.extend)({
			duration: 80,
			minVelocity: 0.2,
			minDistance: 10,
			easing: EASING_EQUATIONS['easeInCubic']
		}, options || {});

		this.supportsTouch = this.supportsTouch();

		if (this.supportsTouch) {
			this.setup(manager);
		}
	}

	_createClass(Snap, [{
		key: "setup",
		value: function setup(manager) {
			this.manager = manager;

			this.layout = this.manager.layout;

			this.fullsize = this.manager.settings.fullsize;
			if (this.fullsize) {
				this.element = this.manager.stage.element;
				this.scroller = window;
				this.disableScroll();
			} else {
				this.element = this.manager.stage.container;
				this.scroller = this.element;
				this.element.style["WebkitOverflowScrolling"] = "touch";
			}

			// this.overflow = this.manager.overflow;

			// set lookahead offset to page width
			this.manager.settings.offset = this.layout.width;
			this.manager.settings.afterScrolledTimeout = this.settings.duration * 2;

			this.isVertical = this.manager.settings.axis === "vertical";

			// disable snapping if not paginated or axis in not horizontal
			if (!this.manager.isPaginated || this.isVertical) {
				return;
			}

			this.touchCanceler = false;
			this.resizeCanceler = false;
			this.snapping = false;

			this.scrollLeft;
			this.scrollTop;

			this.startTouchX = undefined;
			this.startTouchY = undefined;
			this.startTime = undefined;
			this.endTouchX = undefined;
			this.endTouchY = undefined;
			this.endTime = undefined;

			this.addListeners();
		}
	}, {
		key: "supportsTouch",
		value: function supportsTouch() {
			if ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch) {
				return true;
			}

			return false;
		}
	}, {
		key: "disableScroll",
		value: function disableScroll() {
			this.element.style.overflow = "hidden";
		}
	}, {
		key: "enableScroll",
		value: function enableScroll() {
			this.element.style.overflow = "";
		}
	}, {
		key: "addListeners",
		value: function addListeners() {
			this._onResize = this.onResize.bind(this);
			window.addEventListener('resize', this._onResize);

			this._onScroll = this.onScroll.bind(this);
			this.scroller.addEventListener('scroll', this._onScroll);

			this._onTouchStart = this.onTouchStart.bind(this);
			this.scroller.addEventListener('touchstart', this._onTouchStart, { passive: true });
			this.on('touchstart', this._onTouchStart);

			this._onTouchMove = this.onTouchMove.bind(this);
			this.scroller.addEventListener('touchmove', this._onTouchMove, { passive: true });
			this.on('touchmove', this._onTouchMove);

			this._onTouchEnd = this.onTouchEnd.bind(this);
			this.scroller.addEventListener('touchend', this._onTouchEnd, { passive: true });
			this.on('touchend', this._onTouchEnd);

			this._afterDisplayed = this.afterDisplayed.bind(this);
			this.manager.on(_constants.EVENTS.MANAGERS.ADDED, this._afterDisplayed);
		}
	}, {
		key: "removeListeners",
		value: function removeListeners() {
			window.removeEventListener('resize', this._onResize);
			this._onResize = undefined;

			this.scroller.removeEventListener('scroll', this._onScroll);
			this._onScroll = undefined;

			this.scroller.removeEventListener('touchstart', this._onTouchStart, { passive: true });
			this.off('touchstart', this._onTouchStart);
			this._onTouchStart = undefined;

			this.scroller.removeEventListener('touchmove', this._onTouchMove, { passive: true });
			this.off('touchmove', this._onTouchMove);
			this._onTouchMove = undefined;

			this.scroller.removeEventListener('touchend', this._onTouchEnd, { passive: true });
			this.off('touchend', this._onTouchEnd);
			this._onTouchEnd = undefined;

			this.manager.off(_constants.EVENTS.MANAGERS.ADDED, this._afterDisplayed);
			this._afterDisplayed = undefined;
		}
	}, {
		key: "afterDisplayed",
		value: function afterDisplayed(view) {
			var _this = this;

			var contents = view.contents;
			["touchstart", "touchmove", "touchend"].forEach(function (e) {
				contents.on(e, function (ev) {
					return _this.triggerViewEvent(ev, contents);
				});
			});
		}
	}, {
		key: "triggerViewEvent",
		value: function triggerViewEvent(e, contents) {
			this.emit(e.type, e, contents);
		}
	}, {
		key: "onScroll",
		value: function onScroll(e) {
			this.scrollLeft = this.fullsize ? window.scrollX : this.scroller.scrollLeft;
			this.scrollTop = this.fullsize ? window.scrollY : this.scroller.scrollTop;
		}
	}, {
		key: "onResize",
		value: function onResize(e) {
			this.resizeCanceler = true;
		}
	}, {
		key: "onTouchStart",
		value: function onTouchStart(e) {
			var _e$touches$ = e.touches[0],
			    screenX = _e$touches$.screenX,
			    screenY = _e$touches$.screenY;


			if (this.fullsize) {
				this.enableScroll();
			}

			this.touchCanceler = true;

			if (!this.startTouchX) {
				this.startTouchX = screenX;
				this.startTouchY = screenY;
				this.startTime = this.now();
			}

			this.endTouchX = screenX;
			this.endTouchY = screenY;
			this.endTime = this.now();
		}
	}, {
		key: "onTouchMove",
		value: function onTouchMove(e) {
			var _e$touches$2 = e.touches[0],
			    screenX = _e$touches$2.screenX,
			    screenY = _e$touches$2.screenY;

			var deltaY = Math.abs(screenY - this.endTouchY);

			this.touchCanceler = true;

			if (!this.fullsize && deltaY < 10) {
				this.element.scrollLeft -= screenX - this.endTouchX;
			}

			this.endTouchX = screenX;
			this.endTouchY = screenY;
			this.endTime = this.now();
		}
	}, {
		key: "onTouchEnd",
		value: function onTouchEnd(e) {
			if (this.fullsize) {
				this.disableScroll();
			}

			this.touchCanceler = false;

			var swipped = this.wasSwiped();

			if (swipped !== 0) {
				this.snap(swipped);
			} else {
				this.snap();
			}

			this.startTouchX = undefined;
			this.startTouchY = undefined;
			this.startTime = undefined;
			this.endTouchX = undefined;
			this.endTouchY = undefined;
			this.endTime = undefined;
		}
	}, {
		key: "wasSwiped",
		value: function wasSwiped() {
			var snapWidth = this.layout.pageWidth * this.layout.divisor;
			var distance = this.endTouchX - this.startTouchX;
			var absolute = Math.abs(distance);
			var time = this.endTime - this.startTime;
			var velocity = distance / time;
			var minVelocity = this.settings.minVelocity;

			if (absolute <= this.settings.minDistance || absolute >= snapWidth) {
				return 0;
			}

			if (velocity > minVelocity) {
				// previous
				return -1;
			} else if (velocity < -minVelocity) {
				// next
				return 1;
			}
		}
	}, {
		key: "needsSnap",
		value: function needsSnap() {
			var left = this.scrollLeft;
			var snapWidth = this.layout.pageWidth * this.layout.divisor;
			return left % snapWidth !== 0;
		}
	}, {
		key: "snap",
		value: function snap() {
			var howMany = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var left = this.scrollLeft;
			var snapWidth = this.layout.pageWidth * this.layout.divisor;
			var snapTo = Math.round(left / snapWidth) * snapWidth;

			if (howMany) {
				snapTo += howMany * snapWidth;
			}

			return this.smoothScrollTo(snapTo);
		}
	}, {
		key: "smoothScrollTo",
		value: function smoothScrollTo(destination) {
			var deferred = new _core.defer();
			var start = this.scrollLeft;
			var startTime = this.now();

			var duration = this.settings.duration;
			var easing = this.settings.easing;

			this.snapping = true;

			// add animation loop
			function tick() {
				var now = this.now();
				var time = Math.min(1, (now - startTime) / duration);
				var timeFunction = easing(time);

				if (this.touchCanceler || this.resizeCanceler) {
					this.resizeCanceler = false;
					this.snapping = false;
					deferred.resolve();
					return;
				}

				if (time < 1) {
					window.requestAnimationFrame(tick.bind(this));
					this.scrollTo(start + (destination - start) * time, 0);
				} else {
					this.scrollTo(destination, 0);
					this.snapping = false;
					deferred.resolve();
				}
			}

			tick.call(this);

			return deferred.promise;
		}
	}, {
		key: "scrollTo",
		value: function scrollTo() {
			var left = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
			var top = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

			if (this.fullsize) {
				window.scroll(left, top);
			} else {
				this.scroller.scrollLeft = left;
				this.scroller.scrollTop = top;
			}
		}
	}, {
		key: "now",
		value: function now() {
			return 'now' in window.performance ? performance.now() : new Date().getTime();
		}
	}, {
		key: "destroy",
		value: function destroy() {
			if (!this.scroller) {
				return;
			}

			if (this.fullsize) {
				this.enableScroll();
			}

			this.removeListeners();

			this.scroller = undefined;
		}
	}]);

	return Snap;
}();

(0, _eventEmitter2.default)(Snap.prototype);

exports.default = Snap;
module.exports = exports["default"];