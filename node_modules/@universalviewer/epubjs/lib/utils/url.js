"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require("./path");

var _path2 = _interopRequireDefault(_path);

var _pathWebpack = require("path-webpack");

var _pathWebpack2 = _interopRequireDefault(_pathWebpack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * creates a Url object for parsing and manipulation of a url string
 * @param	{string} urlString	a url string (relative or absolute)
 * @param	{string} [baseString] optional base for the url,
 * default to window.location.href
 */
var Url = function () {
	function Url(urlString, baseString) {
		_classCallCheck(this, Url);

		var absolute = urlString.indexOf("://") > -1;
		var pathname = urlString;
		var basePath;

		this.Url = undefined;
		this.href = urlString;
		this.protocol = "";
		this.origin = "";
		this.hash = "";
		this.hash = "";
		this.search = "";
		this.base = baseString;

		if (!absolute && baseString !== false && typeof baseString !== "string" && window && window.location) {
			this.base = window.location.href;
		}

		// URL Polyfill doesn't throw an error if base is empty
		if (absolute || this.base) {
			try {
				if (this.base) {
					// Safari doesn't like an undefined base
					this.Url = new URL(urlString, this.base);
				} else {
					this.Url = new URL(urlString);
				}
				this.href = this.Url.href;

				this.protocol = this.Url.protocol;
				this.origin = this.Url.origin;
				this.hash = this.Url.hash;
				this.search = this.Url.search;

				pathname = this.Url.pathname + (this.Url.search ? this.Url.search : '');
			} catch (e) {
				// Skip URL parsing
				this.Url = undefined;
				// resolve the pathname from the base
				if (this.base) {
					basePath = new _path2.default(this.base);
					pathname = basePath.resolve(pathname);
				}
			}
		}

		this.Path = new _path2.default(pathname);

		this.directory = this.Path.directory;
		this.filename = this.Path.filename;
		this.extension = this.Path.extension;
	}

	/**
  * @returns {Path}
  */


	_createClass(Url, [{
		key: "path",
		value: function path() {
			return this.Path;
		}

		/**
   * Resolves a relative path to a absolute url
   * @param {string} what
   * @returns {string} url
   */

	}, {
		key: "resolve",
		value: function resolve(what) {
			var isAbsolute = what.indexOf("://") > -1;
			var fullpath;

			if (isAbsolute) {
				return what;
			}

			fullpath = _pathWebpack2.default.resolve(this.directory, what);
			return this.origin + fullpath;
		}

		/**
   * Resolve a path relative to the url
   * @param {string} what
   * @returns {string} path
   */

	}, {
		key: "relative",
		value: function relative(what) {
			return _pathWebpack2.default.relative(what, this.directory);
		}

		/**
   * @returns {string}
   */

	}, {
		key: "toString",
		value: function toString() {
			return this.href;
		}
	}]);

	return Url;
}();

exports.default = Url;
module.exports = exports["default"];