"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pathWebpack = require("path-webpack");

var _pathWebpack2 = _interopRequireDefault(_pathWebpack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Creates a Path object for parsing and manipulation of a path strings
 *
 * Uses a polyfill for Nodejs path: https://nodejs.org/api/path.html
 * @param	{string} pathString	a url string (relative or absolute)
 * @class
 */
var Path = function () {
	function Path(pathString) {
		_classCallCheck(this, Path);

		var protocol;
		var parsed;

		protocol = pathString.indexOf("://");
		if (protocol > -1) {
			pathString = new URL(pathString).pathname;
		}

		parsed = this.parse(pathString);

		this.path = pathString;

		if (this.isDirectory(pathString)) {
			this.directory = pathString;
		} else {
			this.directory = parsed.dir + "/";
		}

		this.filename = parsed.base;
		this.extension = parsed.ext.slice(1);
	}

	/**
  * Parse the path: https://nodejs.org/api/path.html#path_path_parse_path
  * @param	{string} what
  * @returns {object}
  */


	_createClass(Path, [{
		key: "parse",
		value: function parse(what) {
			return _pathWebpack2.default.parse(what);
		}

		/**
   * @param	{string} what
   * @returns {boolean}
   */

	}, {
		key: "isAbsolute",
		value: function isAbsolute(what) {
			return _pathWebpack2.default.isAbsolute(what || this.path);
		}

		/**
   * Check if path ends with a directory
   * @param	{string} what
   * @returns {boolean}
   */

	}, {
		key: "isDirectory",
		value: function isDirectory(what) {
			return what.charAt(what.length - 1) === "/";
		}

		/**
   * Resolve a path against the directory of the Path
   *
   * https://nodejs.org/api/path.html#path_path_resolve_paths
   * @param	{string} what
   * @returns {string} resolved
   */

	}, {
		key: "resolve",
		value: function resolve(what) {
			return _pathWebpack2.default.resolve(this.directory, what);
		}

		/**
   * Resolve a path relative to the directory of the Path
   *
   * https://nodejs.org/api/path.html#path_path_relative_from_to
   * @param	{string} what
   * @returns {string} relative
   */

	}, {
		key: "relative",
		value: function relative(what) {
			var isAbsolute = what && what.indexOf("://") > -1;

			if (isAbsolute) {
				return what;
			}

			return _pathWebpack2.default.relative(this.directory, what);
		}
	}, {
		key: "splitPath",
		value: function splitPath(filename) {
			return this.splitPathRe.exec(filename).slice(1);
		}

		/**
   * Return the path string
   * @returns {string} path
   */

	}, {
		key: "toString",
		value: function toString() {
			return this.path;
		}
	}]);

	return Path;
}();

exports.default = Path;
module.exports = exports["default"];