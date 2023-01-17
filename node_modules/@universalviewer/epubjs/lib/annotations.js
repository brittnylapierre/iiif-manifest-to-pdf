"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventEmitter = require("event-emitter");

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _epubcfi = require("./epubcfi");

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _constants = require("./utils/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
	* Handles managing adding & removing Annotations
	* @param {Rendition} rendition
	* @class
	*/
var Annotations = function () {
	function Annotations(rendition) {
		_classCallCheck(this, Annotations);

		this.rendition = rendition;
		this.highlights = [];
		this.underlines = [];
		this.marks = [];
		this._annotations = {};
		this._annotationsBySectionIndex = {};

		this.rendition.hooks.render.register(this.inject.bind(this));
		this.rendition.hooks.unloaded.register(this.clear.bind(this));
	}

	/**
  * Add an annotation to store
  * @param {string} type Type of annotation to add: "highlight", "underline", "mark"
  * @param {EpubCFI} cfiRange EpubCFI range to attach annotation to
  * @param {object} data Data to assign to annotation
  * @param {function} [cb] Callback after annotation is added
  * @param {string} className CSS class to assign to annotation
  * @param {object} styles CSS styles to assign to annotation
  * @returns {Annotation} annotation
  */


	_createClass(Annotations, [{
		key: "add",
		value: function add(type, cfiRange, data, cb, className, styles) {
			var hash = encodeURI(cfiRange + type);
			var cfi = new _epubcfi2.default(cfiRange);
			var sectionIndex = cfi.spinePos;
			var annotation = new Annotation({
				type: type,
				cfiRange: cfiRange,
				data: data,
				sectionIndex: sectionIndex,
				cb: cb,
				className: className,
				styles: styles
			});

			this._annotations[hash] = annotation;

			if (sectionIndex in this._annotationsBySectionIndex) {
				this._annotationsBySectionIndex[sectionIndex].push(hash);
			} else {
				this._annotationsBySectionIndex[sectionIndex] = [hash];
			}

			var views = this.rendition.views();

			views.forEach(function (view) {
				if (annotation.sectionIndex === view.index) {
					annotation.attach(view);
				}
			});

			return annotation;
		}

		/**
   * Remove an annotation from store
   * @param {EpubCFI} cfiRange EpubCFI range the annotation is attached to
   * @param {string} type Type of annotation to add: "highlight", "underline", "mark"
   */

	}, {
		key: "remove",
		value: function remove(cfiRange, type) {
			var _this = this;

			var hash = encodeURI(cfiRange + type);

			if (hash in this._annotations) {
				var annotation = this._annotations[hash];

				if (type && annotation.type !== type) {
					return;
				}

				var views = this.rendition.views();
				views.forEach(function (view) {
					_this._removeFromAnnotationBySectionIndex(annotation.sectionIndex, hash);
					if (annotation.sectionIndex === view.index) {
						annotation.detach(view);
					}
				});

				delete this._annotations[hash];
			}
		}

		/**
   * Remove an annotations by Section Index
   * @private
   */

	}, {
		key: "_removeFromAnnotationBySectionIndex",
		value: function _removeFromAnnotationBySectionIndex(sectionIndex, hash) {
			this._annotationsBySectionIndex[sectionIndex] = this._annotationsAt(sectionIndex).filter(function (h) {
				return h !== hash;
			});
		}

		/**
   * Get annotations by Section Index
   * @private
   */

	}, {
		key: "_annotationsAt",
		value: function _annotationsAt(index) {
			return this._annotationsBySectionIndex[index];
		}

		/**
   * Add a highlight to the store
   * @param {EpubCFI} cfiRange EpubCFI range to attach annotation to
   * @param {object} data Data to assign to annotation
   * @param {function} cb Callback after annotation is clicked
   * @param {string} className CSS class to assign to annotation
   * @param {object} styles CSS styles to assign to annotation
   */

	}, {
		key: "highlight",
		value: function highlight(cfiRange, data, cb, className, styles) {
			return this.add("highlight", cfiRange, data, cb, className, styles);
		}

		/**
   * Add a underline to the store
   * @param {EpubCFI} cfiRange EpubCFI range to attach annotation to
   * @param {object} data Data to assign to annotation
   * @param {function} cb Callback after annotation is clicked
   * @param {string} className CSS class to assign to annotation
   * @param {object} styles CSS styles to assign to annotation
   */

	}, {
		key: "underline",
		value: function underline(cfiRange, data, cb, className, styles) {
			return this.add("underline", cfiRange, data, cb, className, styles);
		}

		/**
   * Add a mark to the store
   * @param {EpubCFI} cfiRange EpubCFI range to attach annotation to
   * @param {object} data Data to assign to annotation
   * @param {function} cb Callback after annotation is clicked
   */

	}, {
		key: "mark",
		value: function mark(cfiRange, data, cb) {
			return this.add("mark", cfiRange, data, cb);
		}

		/**
   * iterate over annotations in the store
   */

	}, {
		key: "each",
		value: function each() {
			return this._annotations.forEach.apply(this._annotations, arguments);
		}

		/**
   * Hook for injecting annotation into a view
   * @param {View} view
   * @private
   */

	}, {
		key: "inject",
		value: function inject(view) {
			var _this2 = this;

			var sectionIndex = view.index;
			if (sectionIndex in this._annotationsBySectionIndex) {
				var annotations = this._annotationsBySectionIndex[sectionIndex];
				annotations.forEach(function (hash) {
					var annotation = _this2._annotations[hash];
					annotation.attach(view);
				});
			}
		}

		/**
   * Hook for removing annotation from a view
   * @param {View} view
   * @private
   */

	}, {
		key: "clear",
		value: function clear(view) {
			var _this3 = this;

			var sectionIndex = view.index;
			if (sectionIndex in this._annotationsBySectionIndex) {
				var annotations = this._annotationsBySectionIndex[sectionIndex];
				annotations.forEach(function (hash) {
					var annotation = _this3._annotations[hash];
					annotation.detach(view);
				});
			}
		}

		/**
   * [Not Implemented] Show annotations
   * @TODO: needs implementation in View
   */

	}, {
		key: "show",
		value: function show() {}

		/**
   * [Not Implemented] Hide annotations
   * @TODO: needs implementation in View
   */

	}, {
		key: "hide",
		value: function hide() {}
	}]);

	return Annotations;
}();

/**
 * Annotation object
 * @class
 * @param {object} options
 * @param {string} options.type Type of annotation to add: "highlight", "underline", "mark"
 * @param {EpubCFI} options.cfiRange EpubCFI range to attach annotation to
 * @param {object} options.data Data to assign to annotation
 * @param {int} options.sectionIndex Index in the Spine of the Section annotation belongs to
 * @param {function} [options.cb] Callback after annotation is clicked
 * @param {string} className CSS class to assign to annotation
 * @param {object} styles CSS styles to assign to annotation
 * @returns {Annotation} annotation
 */


var Annotation = function () {
	function Annotation(_ref) {
		var type = _ref.type,
		    cfiRange = _ref.cfiRange,
		    data = _ref.data,
		    sectionIndex = _ref.sectionIndex,
		    cb = _ref.cb,
		    className = _ref.className,
		    styles = _ref.styles;

		_classCallCheck(this, Annotation);

		this.type = type;
		this.cfiRange = cfiRange;
		this.data = data;
		this.sectionIndex = sectionIndex;
		this.mark = undefined;
		this.cb = cb;
		this.className = className;
		this.styles = styles;
	}

	/**
  * Update stored data
  * @param {object} data
  */


	_createClass(Annotation, [{
		key: "update",
		value: function update(data) {
			this.data = data;
		}

		/**
   * Add to a view
   * @param {View} view
   */

	}, {
		key: "attach",
		value: function attach(view) {
			var cfiRange = this.cfiRange,
			    data = this.data,
			    type = this.type,
			    mark = this.mark,
			    cb = this.cb,
			    className = this.className,
			    styles = this.styles;

			var result = void 0;

			if (type === "highlight") {
				result = view.highlight(cfiRange, data, cb, className, styles);
			} else if (type === "underline") {
				result = view.underline(cfiRange, data, cb, className, styles);
			} else if (type === "mark") {
				result = view.mark(cfiRange, data, cb);
			}

			this.mark = result;
			this.emit(_constants.EVENTS.ANNOTATION.ATTACH, result);
			return result;
		}

		/**
   * Remove from a view
   * @param {View} view
   */

	}, {
		key: "detach",
		value: function detach(view) {
			var cfiRange = this.cfiRange,
			    type = this.type;

			var result = void 0;

			if (view) {
				if (type === "highlight") {
					result = view.unhighlight(cfiRange);
				} else if (type === "underline") {
					result = view.ununderline(cfiRange);
				} else if (type === "mark") {
					result = view.unmark(cfiRange);
				}
			}

			this.mark = undefined;
			this.emit(_constants.EVENTS.ANNOTATION.DETACH, result);
			return result;
		}

		/**
   * [Not Implemented] Get text of an annotation
   * @TODO: needs implementation in contents
   */

	}, {
		key: "text",
		value: function text() {}
	}]);

	return Annotation;
}();

(0, _eventEmitter2.default)(Annotation.prototype);

exports.default = Annotations;
module.exports = exports["default"];