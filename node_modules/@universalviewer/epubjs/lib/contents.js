"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventEmitter = require("event-emitter");

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _core = require("./utils/core");

var _epubcfi = require("./epubcfi");

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _mapping = require("./mapping");

var _mapping2 = _interopRequireDefault(_mapping);

var _replacements = require("./utils/replacements");

var _constants = require("./utils/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var hasNavigator = typeof navigator !== "undefined";

var isChrome = hasNavigator && /Chrome/.test(navigator.userAgent);
var isWebkit = hasNavigator && !isChrome && /AppleWebKit/.test(navigator.userAgent);

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;

/**
	* Handles DOM manipulation, queries and events for View contents
	* @class
	* @param {document} doc Document
	* @param {element} content Parent Element (typically Body)
	* @param {string} cfiBase Section component of CFIs
	* @param {number} sectionIndex Index in Spine of Conntent's Section
	*/

var Contents = function () {
	function Contents(doc, content, cfiBase, sectionIndex) {
		_classCallCheck(this, Contents);

		// Blank Cfi for Parsing
		this.epubcfi = new _epubcfi2.default();

		this.document = doc;
		this.documentElement = this.document.documentElement;
		this.content = content || this.document.body;
		this.window = this.document.defaultView;

		this._size = {
			width: 0,
			height: 0
		};

		this.sectionIndex = sectionIndex || 0;
		this.cfiBase = cfiBase || "";

		this.epubReadingSystem("epub.js", _constants.EPUBJS_VERSION);

		this.listeners();
	}

	/**
 	* Get DOM events that are listened for and passed along
 	*/


	_createClass(Contents, [{
		key: "width",


		/**
  	* Get or Set width
  	* @param {number} [w]
  	* @returns {number} width
  	*/
		value: function width(w) {
			// var frame = this.documentElement;
			var frame = this.content;

			if (w && (0, _core.isNumber)(w)) {
				w = w + "px";
			}

			if (w) {
				frame.style.width = w;
				// this.content.style.width = w;
			}

			return this.window.getComputedStyle(frame)["width"];
		}

		/**
  	* Get or Set height
  	* @param {number} [h]
  	* @returns {number} height
  	*/

	}, {
		key: "height",
		value: function height(h) {
			// var frame = this.documentElement;
			var frame = this.content;

			if (h && (0, _core.isNumber)(h)) {
				h = h + "px";
			}

			if (h) {
				frame.style.height = h;
				// this.content.style.height = h;
			}

			return this.window.getComputedStyle(frame)["height"];
		}

		/**
  	* Get or Set width of the contents
  	* @param {number} [w]
  	* @returns {number} width
  	*/

	}, {
		key: "contentWidth",
		value: function contentWidth(w) {

			var content = this.content || this.document.body;

			if (w && (0, _core.isNumber)(w)) {
				w = w + "px";
			}

			if (w) {
				content.style.width = w;
			}

			return this.window.getComputedStyle(content)["width"];
		}

		/**
  	* Get or Set height of the contents
  	* @param {number} [h]
  	* @returns {number} height
  	*/

	}, {
		key: "contentHeight",
		value: function contentHeight(h) {

			var content = this.content || this.document.body;

			if (h && (0, _core.isNumber)(h)) {
				h = h + "px";
			}

			if (h) {
				content.style.height = h;
			}

			return this.window.getComputedStyle(content)["height"];
		}

		/**
  	* Get the width of the text using Range
  	* @returns {number} width
  	*/

	}, {
		key: "textWidth",
		value: function textWidth() {
			var rect = void 0;
			var width = void 0;
			var range = this.document.createRange();
			var content = this.content || this.document.body;
			var border = (0, _core.borders)(content);

			// Select the contents of frame
			range.selectNodeContents(content);

			// get the width of the text content
			rect = range.getBoundingClientRect();
			width = rect.width;

			if (border && border.width) {
				width += border.width;
			}

			return Math.round(width);
		}

		/**
  	* Get the height of the text using Range
  	* @returns {number} height
  	*/

	}, {
		key: "textHeight",
		value: function textHeight() {
			var rect = void 0;
			var height = void 0;
			var range = this.document.createRange();
			var content = this.content || this.document.body;
			var border = (0, _core.borders)(content);

			range.selectNodeContents(content);

			rect = range.getBoundingClientRect();
			height = rect.height;

			if (height && border.height) {
				height += border.height;
			}

			if (height && rect.top) {
				height += rect.top;
			}

			return Math.round(height);
		}

		/**
  	* Get documentElement scrollWidth
  	* @returns {number} width
  	*/

	}, {
		key: "scrollWidth",
		value: function scrollWidth() {
			var width = this.documentElement.scrollWidth;

			return width;
		}

		/**
  	* Get documentElement scrollHeight
  	* @returns {number} height
  	*/

	}, {
		key: "scrollHeight",
		value: function scrollHeight() {
			var height = this.documentElement.scrollHeight;

			return height;
		}

		/**
  	* Set overflow css style of the contents
  	* @param {string} [overflow]
  	*/

	}, {
		key: "overflow",
		value: function overflow(_overflow) {

			if (_overflow) {
				this.documentElement.style.overflow = _overflow;
			}

			return this.window.getComputedStyle(this.documentElement)["overflow"];
		}

		/**
  	* Set overflowX css style of the documentElement
  	* @param {string} [overflow]
  	*/

	}, {
		key: "overflowX",
		value: function overflowX(overflow) {

			if (overflow) {
				this.documentElement.style.overflowX = overflow;
			}

			return this.window.getComputedStyle(this.documentElement)["overflowX"];
		}

		/**
  	* Set overflowY css style of the documentElement
  	* @param {string} [overflow]
  	*/

	}, {
		key: "overflowY",
		value: function overflowY(overflow) {

			if (overflow) {
				this.documentElement.style.overflowY = overflow;
			}

			return this.window.getComputedStyle(this.documentElement)["overflowY"];
		}

		/**
  	* Set Css styles on the contents element (typically Body)
  	* @param {string} property
  	* @param {string} value
  	* @param {boolean} [priority] set as "important"
  	*/

	}, {
		key: "css",
		value: function css(property, value, priority) {
			var content = this.content || this.document.body;

			if (value) {
				content.style.setProperty(property, value, priority ? "important" : "");
			} else {
				content.style.removeProperty(property);
			}

			return this.window.getComputedStyle(content)[property];
		}

		/**
  	* Get or Set the viewport element
  	* @param {object} [options]
  	* @param {string} [options.width]
  	* @param {string} [options.height]
  	* @param {string} [options.scale]
  	* @param {string} [options.minimum]
  	* @param {string} [options.maximum]
  	* @param {string} [options.scalable]
  	*/

	}, {
		key: "viewport",
		value: function viewport(options) {
			var _width, _height, _scale, _minimum, _maximum, _scalable;
			// var width, height, scale, minimum, maximum, scalable;
			var $viewport = this.document.querySelector("meta[name='viewport']");
			var parsed = {
				"width": undefined,
				"height": undefined,
				"scale": undefined,
				"minimum": undefined,
				"maximum": undefined,
				"scalable": undefined
			};
			var newContent = [];
			var settings = {};

			/*
   * check for the viewport size
   * <meta name="viewport" content="width=1024,height=697" />
   */
			if ($viewport && $viewport.hasAttribute("content")) {
				var content = $viewport.getAttribute("content");
				var _width2 = content.match(/width\s*=\s*([^,]*)/);
				var _height2 = content.match(/height\s*=\s*([^,]*)/);
				var _scale2 = content.match(/initial-scale\s*=\s*([^,]*)/);
				var _minimum2 = content.match(/minimum-scale\s*=\s*([^,]*)/);
				var _maximum2 = content.match(/maximum-scale\s*=\s*([^,]*)/);
				var _scalable2 = content.match(/user-scalable\s*=\s*([^,]*)/);

				if (_width2 && _width2.length && typeof _width2[1] !== "undefined") {
					parsed.width = _width2[1];
				}
				if (_height2 && _height2.length && typeof _height2[1] !== "undefined") {
					parsed.height = _height2[1];
				}
				if (_scale2 && _scale2.length && typeof _scale2[1] !== "undefined") {
					parsed.scale = _scale2[1];
				}
				if (_minimum2 && _minimum2.length && typeof _minimum2[1] !== "undefined") {
					parsed.minimum = _minimum2[1];
				}
				if (_maximum2 && _maximum2.length && typeof _maximum2[1] !== "undefined") {
					parsed.maximum = _maximum2[1];
				}
				if (_scalable2 && _scalable2.length && typeof _scalable2[1] !== "undefined") {
					parsed.scalable = _scalable2[1];
				}
			}

			settings = (0, _core.defaults)(options || {}, parsed);

			if (options) {
				if (settings.width) {
					newContent.push("width=" + settings.width);
				}

				if (settings.height) {
					newContent.push("height=" + settings.height);
				}

				if (settings.scale) {
					newContent.push("initial-scale=" + settings.scale);
				}

				if (settings.scalable === "no") {
					newContent.push("minimum-scale=" + settings.scale);
					newContent.push("maximum-scale=" + settings.scale);
					newContent.push("user-scalable=" + settings.scalable);
				} else {

					if (settings.scalable) {
						newContent.push("user-scalable=" + settings.scalable);
					}

					if (settings.minimum) {
						newContent.push("minimum-scale=" + settings.minimum);
					}

					if (settings.maximum) {
						newContent.push("minimum-scale=" + settings.maximum);
					}
				}

				if (!$viewport) {
					$viewport = this.document.createElement("meta");
					$viewport.setAttribute("name", "viewport");
					this.document.querySelector("head").appendChild($viewport);
				}

				$viewport.setAttribute("content", newContent.join(", "));

				this.window.scrollTo(0, 0);
			}

			return settings;
		}

		/**
   * Event emitter for when the contents has expanded
   * @private
   */

	}, {
		key: "expand",
		value: function expand() {
			this.emit(_constants.EVENTS.CONTENTS.EXPAND);
		}

		/**
   * Add DOM listeners
   * @private
   */

	}, {
		key: "listeners",
		value: function listeners() {
			this.imageLoadListeners();

			this.mediaQueryListeners();

			// this.fontLoadListeners();

			this.addEventListeners();

			this.addSelectionListeners();

			// this.transitionListeners();

			this.resizeListeners();

			// this.resizeObservers();

			this.linksHandler();
		}

		/**
   * Remove DOM listeners
   * @private
   */

	}, {
		key: "removeListeners",
		value: function removeListeners() {

			this.removeEventListeners();

			this.removeSelectionListeners();

			clearTimeout(this.expanding);
		}

		/**
   * Check if size of contents has changed and
   * emit 'resize' event if it has.
   * @private
   */

	}, {
		key: "resizeCheck",
		value: function resizeCheck() {
			var width = this.textWidth();
			var height = this.textHeight();

			if (width != this._size.width || height != this._size.height) {

				this._size = {
					width: width,
					height: height
				};

				this.onResize && this.onResize(this._size);
				this.emit(_constants.EVENTS.CONTENTS.RESIZE, this._size);
			}
		}

		/**
   * Poll for resize detection
   * @private
   */

	}, {
		key: "resizeListeners",
		value: function resizeListeners() {
			var width, height;
			// Test size again
			clearTimeout(this.expanding);
			requestAnimationFrame(this.resizeCheck.bind(this));
		}

		/**
   * Use css transitions to detect resize
   * @private
   */

	}, {
		key: "transitionListeners",
		value: function transitionListeners() {
			var body = this.content;

			body.style['transitionProperty'] = "font, font-size, font-size-adjust, font-stretch, font-variation-settings, font-weight, width, height";
			body.style['transitionDuration'] = "0.001ms";
			body.style['transitionTimingFunction'] = "linear";
			body.style['transitionDelay'] = "0";

			this._resizeCheck = this.resizeCheck.bind(this);
			this.document.addEventListener('transitionend', this._resizeCheck);
		}

		/**
   * Listen for media query changes and emit 'expand' event
   * Adapted from: https://github.com/tylergaw/media-query-events/blob/master/js/mq-events.js
   * @private
   */

	}, {
		key: "mediaQueryListeners",
		value: function mediaQueryListeners() {
			var sheets = this.document.styleSheets;
			var mediaChangeHandler = function (m) {
				if (m.matches && !this._expanding) {
					setTimeout(this.expand.bind(this), 1);
				}
			}.bind(this);

			for (var i = 0; i < sheets.length; i += 1) {
				var rules;
				// Firefox errors if we access cssRules cross-domain
				try {
					rules = sheets[i].cssRules;
				} catch (e) {
					return;
				}
				if (!rules) return; // Stylesheets changed
				for (var j = 0; j < rules.length; j += 1) {
					//if (rules[j].constructor === CSSMediaRule) {
					if (rules[j].media) {
						var mql = this.window.matchMedia(rules[j].media.mediaText);
						mql.addListener(mediaChangeHandler);
						//mql.onchange = mediaChangeHandler;
					}
				}
			}
		}

		/**
   * Use MutationObserver to listen for changes in the DOM and check for resize
   * @private
   */

	}, {
		key: "resizeObservers",
		value: function resizeObservers() {
			var _this = this;

			// create an observer instance
			this.observer = new MutationObserver(function (mutations) {
				_this.resizeCheck();
			});

			// configuration of the observer:
			var config = { attributes: true, childList: true, characterData: true, subtree: true };

			// pass in the target node, as well as the observer options
			this.observer.observe(this.document, config);
		}

		/**
   * Test if images are loaded or add listener for when they load
   * @private
   */

	}, {
		key: "imageLoadListeners",
		value: function imageLoadListeners() {
			var images = this.document.querySelectorAll("img");
			var img;
			for (var i = 0; i < images.length; i++) {
				img = images[i];

				if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0) {
					img.onload = this.expand.bind(this);
				}
			}
		}

		/**
   * Listen for font load and check for resize when loaded
   * @private
   */

	}, {
		key: "fontLoadListeners",
		value: function fontLoadListeners() {
			if (!this.document || !this.document.fonts) {
				return;
			}

			this.document.fonts.ready.then(function () {
				this.resizeCheck();
			}.bind(this));
		}

		/**
   * Get the documentElement
   * @returns {element} documentElement
   */

	}, {
		key: "root",
		value: function root() {
			if (!this.document) return null;
			return this.document.documentElement;
		}

		/**
   * Get the location offset of a EpubCFI or an #id
   * @param {string | EpubCFI} target
   * @param {string} [ignoreClass] for the cfi
   * @returns { {left: Number, top: Number }
   */

	}, {
		key: "locationOf",
		value: function locationOf(target, ignoreClass) {
			var position;
			var targetPos = { "left": 0, "top": 0 };

			if (!this.document) return targetPos;

			if (this.epubcfi.isCfiString(target)) {
				var range = new _epubcfi2.default(target).toRange(this.document, ignoreClass);

				if (range) {
					try {
						if (!range.endContainer || range.startContainer == range.endContainer && range.startOffset == range.endOffset) {
							// If the end for the range is not set, it results in collapsed becoming
							// true. This in turn leads to inconsistent behaviour when calling 
							// getBoundingRect. Wrong bounds lead to the wrong page being displayed.
							// https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/15684911/
							var pos = range.startContainer.textContent.indexOf(" ", range.startOffset);
							if (pos == -1) {
								pos = range.startContainer.textContent.length;
							}
							range.setEnd(range.startContainer, pos);
						}
					} catch (e) {
						console.error("setting end offset to start container length failed", e);
					}

					if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
						position = range.startContainer.getBoundingClientRect();
						targetPos.left = position.left;
						targetPos.top = position.top;
					} else {
						// Webkit does not handle collapsed range bounds correctly
						// https://bugs.webkit.org/show_bug.cgi?id=138949

						// Construct a new non-collapsed range
						if (isWebkit) {
							var container = range.startContainer;
							var newRange = new Range();
							try {
								if (container.nodeType === ELEMENT_NODE) {
									position = container.getBoundingClientRect();
								} else if (range.startOffset + 2 < container.length) {
									newRange.setStart(container, range.startOffset);
									newRange.setEnd(container, range.startOffset + 2);
									position = newRange.getBoundingClientRect();
								} else if (range.startOffset - 2 > 0) {
									newRange.setStart(container, range.startOffset - 2);
									newRange.setEnd(container, range.startOffset);
									position = newRange.getBoundingClientRect();
								} else {
									// empty, return the parent element
									position = container.parentNode.getBoundingClientRect();
								}
							} catch (e) {
								console.error(e, e.stack);
							}
						} else {
							position = range.getBoundingClientRect();
						}
					}
				}
			} else if (typeof target === "string" && target.indexOf("#") > -1) {

				var id = target.substring(target.indexOf("#") + 1);
				var el = this.document.getElementById(id);
				if (el) {
					if (isWebkit) {
						// Webkit reports incorrect bounding rects in Columns
						var _newRange = new Range();
						_newRange.selectNode(el);
						position = _newRange.getBoundingClientRect();
					} else {
						position = el.getBoundingClientRect();
					}
				}
			}

			if (position) {
				targetPos.left = position.left;
				targetPos.top = position.top;
			}

			return targetPos;
		}

		/**
   * Append a stylesheet link to the document head
   * @param {string} src url
   */

	}, {
		key: "addStylesheet",
		value: function addStylesheet(src) {
			return new Promise(function (resolve, reject) {
				var $stylesheet;
				var ready = false;

				if (!this.document) {
					resolve(false);
					return;
				}

				// Check if link already exists
				$stylesheet = this.document.querySelector("link[href='" + src + "']");
				if ($stylesheet) {
					resolve(true);
					return; // already present
				}

				$stylesheet = this.document.createElement("link");
				$stylesheet.type = "text/css";
				$stylesheet.rel = "stylesheet";
				$stylesheet.href = src;
				$stylesheet.onload = $stylesheet.onreadystatechange = function () {
					if (!ready && (!this.readyState || this.readyState == "complete")) {
						ready = true;
						// Let apply
						setTimeout(function () {
							resolve(true);
						}, 1);
					}
				};

				this.document.head.appendChild($stylesheet);
			}.bind(this));
		}

		/**
   * Append stylesheet rules to a generate stylesheet
   * Array: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
   * Object: https://github.com/desirable-objects/json-to-css
   * @param {array | object} rules
   */

	}, {
		key: "addStylesheetRules",
		value: function addStylesheetRules(rules) {
			var styleEl;
			var styleSheet;
			var key = "epubjs-inserted-css";

			if (!this.document || !rules || rules.length === 0) return;

			// Check if link already exists
			styleEl = this.document.getElementById("#" + key);
			if (!styleEl) {
				styleEl = this.document.createElement("style");
				styleEl.id = key;
			}

			// Append style element to head
			this.document.head.appendChild(styleEl);

			// Grab style sheet
			styleSheet = styleEl.sheet;

			if (Object.prototype.toString.call(rules) === "[object Array]") {
				for (var i = 0, rl = rules.length; i < rl; i++) {
					var j = 1,
					    rule = rules[i],
					    selector = rules[i][0],
					    propStr = "";
					// If the second argument of a rule is an array of arrays, correct our variables.
					if (Object.prototype.toString.call(rule[1][0]) === "[object Array]") {
						rule = rule[1];
						j = 0;
					}

					for (var pl = rule.length; j < pl; j++) {
						var prop = rule[j];
						propStr += prop[0] + ":" + prop[1] + (prop[2] ? " !important" : "") + ";\n";
					}

					// Insert CSS Rule
					styleSheet.insertRule(selector + "{" + propStr + "}", styleSheet.cssRules.length);
				}
			} else {
				var selectors = Object.keys(rules);
				selectors.forEach(function (selector) {
					var definition = rules[selector];
					if (Array.isArray(definition)) {
						definition.forEach(function (item) {
							var _rules = Object.keys(item);
							var result = _rules.map(function (rule) {
								return rule + ":" + item[rule];
							}).join(';');
							styleSheet.insertRule(selector + "{" + result + "}", styleSheet.cssRules.length);
						});
					} else {
						var _rules = Object.keys(definition);
						var result = _rules.map(function (rule) {
							return rule + ":" + definition[rule];
						}).join(';');
						styleSheet.insertRule(selector + "{" + result + "}", styleSheet.cssRules.length);
					}
				});
			}
		}

		/**
   * Append a script tag to the document head
   * @param {string} src url
   * @returns {Promise} loaded
   */

	}, {
		key: "addScript",
		value: function addScript(src) {

			return new Promise(function (resolve, reject) {
				var $script;
				var ready = false;

				if (!this.document) {
					resolve(false);
					return;
				}

				$script = this.document.createElement("script");
				$script.type = "text/javascript";
				$script.async = true;
				$script.src = src;
				$script.onload = $script.onreadystatechange = function () {
					if (!ready && (!this.readyState || this.readyState == "complete")) {
						ready = true;
						setTimeout(function () {
							resolve(true);
						}, 1);
					}
				};

				this.document.head.appendChild($script);
			}.bind(this));
		}

		/**
   * Add a class to the contents container
   * @param {string} className
   */

	}, {
		key: "addClass",
		value: function addClass(className) {
			var content;

			if (!this.document) return;

			content = this.content || this.document.body;

			if (content) {
				content.classList.add(className);
			}
		}

		/**
   * Remove a class from the contents container
   * @param {string} removeClass
   */

	}, {
		key: "removeClass",
		value: function removeClass(className) {
			var content;

			if (!this.document) return;

			content = this.content || this.document.body;

			if (content) {
				content.classList.remove(className);
			}
		}

		/**
   * Add DOM event listeners
   * @private
   */

	}, {
		key: "addEventListeners",
		value: function addEventListeners() {
			if (!this.document) {
				return;
			}

			this._triggerEvent = this.triggerEvent.bind(this);

			_constants.DOM_EVENTS.forEach(function (eventName) {
				this.document.addEventListener(eventName, this._triggerEvent, { passive: true });
			}, this);
		}

		/**
   * Remove DOM event listeners
   * @private
   */

	}, {
		key: "removeEventListeners",
		value: function removeEventListeners() {
			if (!this.document) {
				return;
			}
			_constants.DOM_EVENTS.forEach(function (eventName) {
				this.document.removeEventListener(eventName, this._triggerEvent, { passive: true });
			}, this);
			this._triggerEvent = undefined;
		}

		/**
   * Emit passed browser events
   * @private
   */

	}, {
		key: "triggerEvent",
		value: function triggerEvent(e) {
			this.emit(e.type, e);
		}

		/**
   * Add listener for text selection
   * @private
   */

	}, {
		key: "addSelectionListeners",
		value: function addSelectionListeners() {
			if (!this.document) {
				return;
			}
			this._onSelectionChange = this.onSelectionChange.bind(this);
			this.document.addEventListener("selectionchange", this._onSelectionChange, { passive: true });
		}

		/**
   * Remove listener for text selection
   * @private
   */

	}, {
		key: "removeSelectionListeners",
		value: function removeSelectionListeners() {
			if (!this.document) {
				return;
			}
			this.document.removeEventListener("selectionchange", this._onSelectionChange, { passive: true });
			this._onSelectionChange = undefined;
		}

		/**
   * Handle getting text on selection
   * @private
   */

	}, {
		key: "onSelectionChange",
		value: function onSelectionChange(e) {
			if (this.selectionEndTimeout) {
				clearTimeout(this.selectionEndTimeout);
			}
			this.selectionEndTimeout = setTimeout(function () {
				var selection = this.window.getSelection();
				this.triggerSelectedEvent(selection);
			}.bind(this), 250);
		}

		/**
   * Emit event on text selection
   * @private
   */

	}, {
		key: "triggerSelectedEvent",
		value: function triggerSelectedEvent(selection) {
			var range, cfirange;

			if (selection && selection.rangeCount > 0) {
				range = selection.getRangeAt(0);
				if (!range.collapsed) {
					// cfirange = this.section.cfiFromRange(range);
					cfirange = new _epubcfi2.default(range, this.cfiBase).toString();
					this.emit(_constants.EVENTS.CONTENTS.SELECTED, cfirange);
					this.emit(_constants.EVENTS.CONTENTS.SELECTED_RANGE, range);
				}
			}
		}

		/**
   * Get a Dom Range from EpubCFI
   * @param {EpubCFI} _cfi
   * @param {string} [ignoreClass]
   * @returns {Range} range
   */

	}, {
		key: "range",
		value: function range(_cfi, ignoreClass) {
			var cfi = new _epubcfi2.default(_cfi);
			return cfi.toRange(this.document, ignoreClass);
		}

		/**
   * Get an EpubCFI from a Dom Range
   * @param {Range} range
   * @param {string} [ignoreClass]
   * @returns {EpubCFI} cfi
   */

	}, {
		key: "cfiFromRange",
		value: function cfiFromRange(range, ignoreClass) {
			return new _epubcfi2.default(range, this.cfiBase, ignoreClass).toString();
		}

		/**
   * Get an EpubCFI from a Dom node
   * @param {node} node
   * @param {string} [ignoreClass]
   * @returns {EpubCFI} cfi
   */

	}, {
		key: "cfiFromNode",
		value: function cfiFromNode(node, ignoreClass) {
			return new _epubcfi2.default(node, this.cfiBase, ignoreClass).toString();
		}

		// TODO: find where this is used - remove?

	}, {
		key: "map",
		value: function map(layout) {
			var map = new _mapping2.default(layout);
			return map.section();
		}

		/**
   * Size the contents to a given width and height
   * @param {number} [width]
   * @param {number} [height]
   */

	}, {
		key: "size",
		value: function size(width, height) {
			var viewport = { scale: 1.0, scalable: "no" };

			this.layoutStyle("scrolling");

			if (width >= 0) {
				this.width(width);
				viewport.width = width;
				this.css("padding", "0 " + width / 12 + "px");
			}

			if (height >= 0) {
				this.height(height);
				viewport.height = height;
			}

			this.css("margin", "0");
			this.css("box-sizing", "border-box");

			this.viewport(viewport);
		}

		/**
   * Apply columns to the contents for pagination
   * @param {number} width
   * @param {number} height
   * @param {number} columnWidth
   * @param {number} gap
   */

	}, {
		key: "columns",
		value: function columns(width, height, columnWidth, gap) {
			var COLUMN_AXIS = (0, _core.prefixed)("column-axis");
			var COLUMN_GAP = (0, _core.prefixed)("column-gap");
			var COLUMN_WIDTH = (0, _core.prefixed)("column-width");
			var COLUMN_FILL = (0, _core.prefixed)("column-fill");

			var writingMode = this.writingMode();
			var axis = writingMode.indexOf("vertical") === 0 ? "vertical" : "horizontal";

			this.layoutStyle("paginated");

			// Fix body width issues if rtl is only set on body element
			if (this.content.dir === "rtl") {
				this.direction("rtl");
			}

			this.width(width);
			this.height(height);

			// Deal with Mobile trying to scale to viewport
			this.viewport({ width: width, height: height, scale: 1.0, scalable: "no" });

			// TODO: inline-block needs more testing
			// Fixes Safari column cut offs, but causes RTL issues
			// this.css("display", "inline-block");

			this.css("overflow-y", "hidden");
			this.css("margin", "0", true);

			if (axis === "vertical") {
				this.css("padding-top", gap / 2 + "px", true);
				this.css("padding-bottom", gap / 2 + "px", true);
				this.css("padding-left", "20px");
				this.css("padding-right", "20px");
			} else {
				this.css("padding-top", "20px");
				this.css("padding-bottom", "20px");
				this.css("padding-left", gap / 2 + "px", true);
				this.css("padding-right", gap / 2 + "px", true);
			}

			this.css("box-sizing", "border-box");
			this.css("max-width", "inherit");

			this.css(COLUMN_AXIS, "horizontal");
			this.css(COLUMN_FILL, "auto");

			this.css(COLUMN_GAP, gap + "px");
			this.css(COLUMN_WIDTH, columnWidth + "px");

			// Fix glyph clipping in WebKit
			// https://github.com/futurepress/epub.js/issues/983
			this.css("-webkit-line-box-contain", "block glyphs replaced");
		}

		/**
   * Scale contents from center
   * @param {number} scale
   * @param {number} offsetX
   * @param {number} offsetY
   */

	}, {
		key: "scaler",
		value: function scaler(scale, offsetX, offsetY) {
			var scaleStr = "scale(" + scale + ")";
			var translateStr = "";
			// this.css("position", "absolute"));
			this.css("transform-origin", "top left");

			if (offsetX >= 0 || offsetY >= 0) {
				translateStr = " translate(" + (offsetX || 0) + "px, " + (offsetY || 0) + "px )";
			}

			this.css("transform", scaleStr + translateStr);
		}

		/**
   * Fit contents into a fixed width and height
   * @param {number} width
   * @param {number} height
   */

	}, {
		key: "fit",
		value: function fit(width, height) {
			var viewport = this.viewport();
			var viewportWidth = parseInt(viewport.width);
			var viewportHeight = parseInt(viewport.height);
			var widthScale = width / viewportWidth;
			var heightScale = height / viewportHeight;
			var scale = widthScale < heightScale ? widthScale : heightScale;

			// the translate does not work as intended, elements can end up unaligned
			// var offsetY = (height - (viewportHeight * scale)) / 2;
			// var offsetX = 0;
			// if (this.sectionIndex % 2 === 1) {
			// 	offsetX = width - (viewportWidth * scale);
			// }

			this.layoutStyle("paginated");

			// scale needs width and height to be set
			this.width(viewportWidth);
			this.height(viewportHeight);
			this.overflow("hidden");

			// Scale to the correct size
			this.scaler(scale, 0, 0);
			// this.scaler(scale, offsetX > 0 ? offsetX : 0, offsetY);

			// background images are not scaled by transform
			this.css("background-size", viewportWidth * scale + "px " + viewportHeight * scale + "px");

			this.css("background-color", "transparent");
		}

		/**
   * Set the direction of the text
   * @param {string} [dir="ltr"] "rtl" | "ltr"
   */

	}, {
		key: "direction",
		value: function direction(dir) {
			if (this.documentElement) {
				this.documentElement.style["direction"] = dir;
			}
		}
	}, {
		key: "mapPage",
		value: function mapPage(cfiBase, layout, start, end, dev) {
			var mapping = new _mapping2.default(layout, dev);

			return mapping.page(this, cfiBase, start, end);
		}

		/**
   * Emit event when link in content is clicked
   * @private
   */

	}, {
		key: "linksHandler",
		value: function linksHandler() {
			var _this2 = this;

			(0, _replacements.replaceLinks)(this.content, function (href) {
				_this2.emit(_constants.EVENTS.CONTENTS.LINK_CLICKED, href);
			});
		}

		/**
   * Set the writingMode of the text
   * @param {string} [mode="horizontal-tb"] "horizontal-tb" | "vertical-rl" | "vertical-lr"
   */

	}, {
		key: "writingMode",
		value: function writingMode(mode) {
			var WRITING_MODE = (0, _core.prefixed)("writing-mode");

			if (mode && this.documentElement) {
				this.documentElement.style[WRITING_MODE] = mode;
			}

			return this.window.getComputedStyle(this.documentElement)[WRITING_MODE] || '';
		}

		/**
   * Set the layoutStyle of the content
   * @param {string} [style="paginated"] "scrolling" | "paginated"
   * @private
   */

	}, {
		key: "layoutStyle",
		value: function layoutStyle(style) {

			if (style) {
				this._layoutStyle = style;
				navigator.epubReadingSystem.layoutStyle = this._layoutStyle;
			}

			return this._layoutStyle || "paginated";
		}

		/**
   * Add the epubReadingSystem object to the navigator
   * @param {string} name
   * @param {string} version
   * @private
   */

	}, {
		key: "epubReadingSystem",
		value: function epubReadingSystem(name, version) {
			navigator.epubReadingSystem = {
				name: name,
				version: version,
				layoutStyle: this.layoutStyle(),
				hasFeature: function hasFeature(feature) {
					switch (feature) {
						case "dom-manipulation":
							return true;
						case "layout-changes":
							return true;
						case "touch-events":
							return true;
						case "mouse-events":
							return true;
						case "keyboard-events":
							return true;
						case "spine-scripting":
							return false;
						default:
							return false;
					}
				}
			};
			return navigator.epubReadingSystem;
		}
	}, {
		key: "destroy",
		value: function destroy() {
			// Stop observing
			if (this.observer) {
				this.observer.disconnect();
			}

			this.document.removeEventListener('transitionend', this._resizeCheck);

			this.removeListeners();
		}
	}], [{
		key: "listenedEvents",
		get: function get() {
			return _constants.DOM_EVENTS;
		}
	}]);

	return Contents;
}();

(0, _eventEmitter2.default)(Contents.prototype);

exports.default = Contents;
module.exports = exports["default"];