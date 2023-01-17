"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _url = require("./utils/url");

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Themes to apply to displayed content
 * @class
 * @param {Rendition} rendition
 */
var Themes = function () {
	function Themes(rendition) {
		_classCallCheck(this, Themes);

		this.rendition = rendition;
		this._themes = {
			"default": {
				"rules": {},
				"url": "",
				"serialized": ""
			}
		};
		this._overrides = {};
		this._current = "default";
		this._injected = [];
		this.rendition.hooks.content.register(this.inject.bind(this));
		this.rendition.hooks.content.register(this.overrides.bind(this));
	}

	/**
  * Add themes to be used by a rendition
  * @param {object | Array<object> | string}
  * @example themes.register("light", "http://example.com/light.css")
  * @example themes.register("light", { "body": { "color": "purple"}})
  * @example themes.register({ "light" : {...}, "dark" : {...}})
  */


	_createClass(Themes, [{
		key: "register",
		value: function register() {
			if (arguments.length === 0) {
				return;
			}
			if (arguments.length === 1 && _typeof(arguments[0]) === "object") {
				return this.registerThemes(arguments[0]);
			}
			if (arguments.length === 1 && typeof arguments[0] === "string") {
				return this.default(arguments[0]);
			}
			if (arguments.length === 2 && typeof arguments[1] === "string") {
				return this.registerUrl(arguments[0], arguments[1]);
			}
			if (arguments.length === 2 && _typeof(arguments[1]) === "object") {
				return this.registerRules(arguments[0], arguments[1]);
			}
		}

		/**
   * Add a default theme to be used by a rendition
   * @param {object | string} theme
   * @example themes.register("http://example.com/default.css")
   * @example themes.register({ "body": { "color": "purple"}})
   */

	}, {
		key: "default",
		value: function _default(theme) {
			if (!theme) {
				return;
			}
			if (typeof theme === "string") {
				return this.registerUrl("default", theme);
			}
			if ((typeof theme === "undefined" ? "undefined" : _typeof(theme)) === "object") {
				return this.registerRules("default", theme);
			}
		}

		/**
   * Register themes object
   * @param {object} themes
   */

	}, {
		key: "registerThemes",
		value: function registerThemes(themes) {
			for (var theme in themes) {
				if (themes.hasOwnProperty(theme)) {
					if (typeof themes[theme] === "string") {
						this.registerUrl(theme, themes[theme]);
					} else {
						this.registerRules(theme, themes[theme]);
					}
				}
			}
		}

		/**
   * Register a url
   * @param {string} name
   * @param {string} input
   */

	}, {
		key: "registerUrl",
		value: function registerUrl(name, input) {
			var url = new _url2.default(input);
			this._themes[name] = { "url": url.toString() };
			if (this._injected[name]) {
				this.update(name);
			}
		}

		/**
   * Register rule
   * @param {string} name
   * @param {object} rules
   */

	}, {
		key: "registerRules",
		value: function registerRules(name, rules) {
			this._themes[name] = { "rules": rules };
			// TODO: serialize css rules
			if (this._injected[name]) {
				this.update(name);
			}
		}

		/**
   * Select a theme
   * @param {string} name
   */

	}, {
		key: "select",
		value: function select(name) {
			var prev = this._current;
			var contents;

			this._current = name;
			this.update(name);

			contents = this.rendition.getContents();
			contents.forEach(function (content) {
				content.removeClass(prev);
				content.addClass(name);
			});
		}

		/**
   * Update a theme
   * @param {string} name
   */

	}, {
		key: "update",
		value: function update(name) {
			var _this = this;

			var contents = this.rendition.getContents();
			contents.forEach(function (content) {
				_this.add(name, content);
			});
		}

		/**
   * Inject all themes into contents
   * @param {Contents} contents
   */

	}, {
		key: "inject",
		value: function inject(contents) {
			var links = [];
			var themes = this._themes;
			var theme;

			for (var name in themes) {
				if (themes.hasOwnProperty(name) && (name === this._current || name === "default")) {
					theme = themes[name];
					if (theme.rules && Object.keys(theme.rules).length > 0 || theme.url && links.indexOf(theme.url) === -1) {
						this.add(name, contents);
					}
					this._injected.push(name);
				}
			}

			if (this._current != "default") {
				contents.addClass(this._current);
			}
		}

		/**
   * Add Theme to contents
   * @param {string} name
   * @param {Contents} contents
   */

	}, {
		key: "add",
		value: function add(name, contents) {
			var theme = this._themes[name];

			if (!theme || !contents) {
				return;
			}

			if (theme.url) {
				contents.addStylesheet(theme.url);
			} else if (theme.serialized) {
				// TODO: handle serialized
			} else if (theme.rules) {
				contents.addStylesheetRules(theme.rules);
				theme.injected = true;
			}
		}

		/**
   * Add override
   * @param {string} name
   * @param {string} value
   * @param {boolean} priority
   */

	}, {
		key: "override",
		value: function override(name, value, priority) {
			var _this2 = this;

			var contents = this.rendition.getContents();

			this._overrides[name] = {
				value: value,
				priority: priority === true
			};

			contents.forEach(function (content) {
				content.css(name, _this2._overrides[name].value, _this2._overrides[name].priority);
			});
		}
	}, {
		key: "removeOverride",
		value: function removeOverride(name) {
			var contents = this.rendition.getContents();

			delete this._overrides[name];

			contents.forEach(function (content) {
				content.css(name);
			});
		}

		/**
   * Add all overrides
   * @param {Content} content
   */

	}, {
		key: "overrides",
		value: function overrides(contents) {
			var overrides = this._overrides;

			for (var rule in overrides) {
				if (overrides.hasOwnProperty(rule)) {
					contents.css(rule, overrides[rule].value, overrides[rule].priority);
				}
			}
		}

		/**
   * Adjust the font size of a rendition
   * @param {number} size
   */

	}, {
		key: "fontSize",
		value: function fontSize(size) {
			this.override("font-size", size);
		}

		/**
   * Adjust the font-family of a rendition
   * @param {string} f
   */

	}, {
		key: "font",
		value: function font(f) {
			this.override("font-family", f, true);
		}
	}, {
		key: "destroy",
		value: function destroy() {
			this.rendition = undefined;
			this._themes = undefined;
			this._overrides = undefined;
			this._current = undefined;
			this._injected = undefined;
		}
	}]);

	return Themes;
}();

exports.default = Themes;
module.exports = exports["default"];