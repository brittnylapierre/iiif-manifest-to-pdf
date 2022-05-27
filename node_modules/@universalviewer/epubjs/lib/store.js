"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require("./utils/core");

var _request = require("./utils/request");

var _request2 = _interopRequireDefault(_request);

var _mime = require("../libs/mime/mime");

var _mime2 = _interopRequireDefault(_mime);

var _path = require("./utils/path");

var _path2 = _interopRequireDefault(_path);

var _eventEmitter = require("event-emitter");

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Handles saving and requesting files from local storage
 * @class
 * @param {string} name This should be the name of the application for modals
 * @param {function} [requester]
 * @param {function} [resolver]
 */
var Store = function () {
	function Store(name, requester, resolver) {
		_classCallCheck(this, Store);

		this.urlCache = {};

		this.storage = undefined;

		this.name = name;
		this.requester = requester || _request2.default;
		this.resolver = resolver;

		this.online = true;

		this.checkRequirements();

		this.addListeners();
	}

	/**
  * Checks to see if localForage exists in global namspace,
  * Requires localForage if it isn't there
  * @private
  */


	_createClass(Store, [{
		key: "checkRequirements",
		value: function checkRequirements() {
			try {
				var store = void 0;
				if (typeof localforage === "undefined") {
					store = require("localforage");
				} else {
					store = localforage;
				}
				this.storage = store.createInstance({
					name: this.name
				});
			} catch (e) {
				throw new Error("localForage lib not loaded");
			}
		}

		/**
   * Add online and offline event listeners
   * @private
   */

	}, {
		key: "addListeners",
		value: function addListeners() {
			this._status = this.status.bind(this);
			window.addEventListener('online', this._status);
			window.addEventListener('offline', this._status);
		}

		/**
   * Remove online and offline event listeners
   * @private
   */

	}, {
		key: "removeListeners",
		value: function removeListeners() {
			window.removeEventListener('online', this._status);
			window.removeEventListener('offline', this._status);
			this._status = undefined;
		}

		/**
   * Update the online / offline status
   * @private
   */

	}, {
		key: "status",
		value: function status(event) {
			var online = navigator.onLine;
			this.online = online;
			if (online) {
				this.emit("online", this);
			} else {
				this.emit("offline", this);
			}
		}

		/**
   * Add all of a book resources to the store
   * @param  {Resources} resources  book resources
   * @param  {boolean} [force] force resaving resources
   * @return {Promise<object>} store objects
   */

	}, {
		key: "add",
		value: function add(resources, force) {
			var _this = this;

			var mapped = resources.resources.map(function (item) {
				var href = item.href;

				var url = _this.resolver(href);
				var encodedUrl = window.encodeURIComponent(url);

				return _this.storage.getItem(encodedUrl).then(function (item) {
					if (!item || force) {
						return _this.requester(url, "binary").then(function (data) {
							return _this.storage.setItem(encodedUrl, data);
						});
					} else {
						return item;
					}
				});
			});
			return Promise.all(mapped);
		}

		/**
   * Put binary data from a url to storage
   * @param  {string} url  a url to request from storage
   * @param  {boolean} [withCredentials]
   * @param  {object} [headers]
   * @return {Promise<Blob>}
   */

	}, {
		key: "put",
		value: function put(url, withCredentials, headers) {
			var _this2 = this;

			var encodedUrl = window.encodeURIComponent(url);

			return this.storage.getItem(encodedUrl).then(function (result) {
				if (!result) {
					return _this2.requester(url, "binary", withCredentials, headers).then(function (data) {
						return _this2.storage.setItem(encodedUrl, data);
					});
				}
				return result;
			});
		}

		/**
   * Request a url
   * @param  {string} url  a url to request from storage
   * @param  {string} [type] specify the type of the returned result
   * @param  {boolean} [withCredentials]
   * @param  {object} [headers]
   * @return {Promise<Blob | string | JSON | Document | XMLDocument>}
   */

	}, {
		key: "request",
		value: function request(url, type, withCredentials, headers) {
			var _this3 = this;

			if (this.online) {
				// From network
				return this.requester(url, type, withCredentials, headers).then(function (data) {
					// save to store if not present
					_this3.put(url);
					return data;
				});
			} else {
				// From store
				return this.retrieve(url, type);
			}
		}

		/**
   * Request a url from storage
   * @param  {string} url  a url to request from storage
   * @param  {string} [type] specify the type of the returned result
   * @return {Promise<Blob | string | JSON | Document | XMLDocument>}
   */

	}, {
		key: "retrieve",
		value: function retrieve(url, type) {
			var _this4 = this;

			var deferred = new _core.defer();
			var response;
			var path = new _path2.default(url);

			// If type isn't set, determine it from the file extension
			if (!type) {
				type = path.extension;
			}

			if (type == "blob") {
				response = this.getBlob(url);
			} else {
				response = this.getText(url);
			}

			return response.then(function (r) {
				var deferred = new _core.defer();
				var result;
				if (r) {
					result = _this4.handleResponse(r, type);
					deferred.resolve(result);
				} else {
					deferred.reject({
						message: "File not found in storage: " + url,
						stack: new Error().stack
					});
				}
				return deferred.promise;
			});
		}

		/**
   * Handle the response from request
   * @private
   * @param  {any} response
   * @param  {string} [type]
   * @return {any} the parsed result
   */

	}, {
		key: "handleResponse",
		value: function handleResponse(response, type) {
			var r;

			if (type == "json") {
				r = JSON.parse(response);
			} else if ((0, _core.isXml)(type)) {
				r = (0, _core.parse)(response, "text/xml");
			} else if (type == "xhtml") {
				r = (0, _core.parse)(response, "application/xhtml+xml");
			} else if (type == "html" || type == "htm") {
				r = (0, _core.parse)(response, "text/html");
			} else {
				r = response;
			}

			return r;
		}

		/**
   * Get a Blob from Storage by Url
   * @param  {string} url
   * @param  {string} [mimeType]
   * @return {Blob}
   */

	}, {
		key: "getBlob",
		value: function getBlob(url, mimeType) {
			var encodedUrl = window.encodeURIComponent(url);

			return this.storage.getItem(encodedUrl).then(function (uint8array) {
				if (!uint8array) return;

				mimeType = mimeType || _mime2.default.lookup(url);

				return new Blob([uint8array], { type: mimeType });
			});
		}

		/**
   * Get Text from Storage by Url
   * @param  {string} url
   * @param  {string} [mimeType]
   * @return {string}
   */

	}, {
		key: "getText",
		value: function getText(url, mimeType) {
			var encodedUrl = window.encodeURIComponent(url);

			mimeType = mimeType || _mime2.default.lookup(url);

			return this.storage.getItem(encodedUrl).then(function (uint8array) {
				var deferred = new _core.defer();
				var reader = new FileReader();
				var blob;

				if (!uint8array) return;

				blob = new Blob([uint8array], { type: mimeType });

				reader.addEventListener("loadend", function () {
					deferred.resolve(reader.result);
				});

				reader.readAsText(blob, mimeType);

				return deferred.promise;
			});
		}

		/**
   * Get a base64 encoded result from Storage by Url
   * @param  {string} url
   * @param  {string} [mimeType]
   * @return {string} base64 encoded
   */

	}, {
		key: "getBase64",
		value: function getBase64(url, mimeType) {
			var encodedUrl = window.encodeURIComponent(url);

			mimeType = mimeType || _mime2.default.lookup(url);

			return this.storage.getItem(encodedUrl).then(function (uint8array) {
				var deferred = new _core.defer();
				var reader = new FileReader();
				var blob;

				if (!uint8array) return;

				blob = new Blob([uint8array], { type: mimeType });

				reader.addEventListener("loadend", function () {
					deferred.resolve(reader.result);
				});
				reader.readAsDataURL(blob, mimeType);

				return deferred.promise;
			});
		}

		/**
   * Create a Url from a stored item
   * @param  {string} url
   * @param  {object} [options.base64] use base64 encoding or blob url
   * @return {Promise} url promise with Url string
   */

	}, {
		key: "createUrl",
		value: function createUrl(url, options) {
			var deferred = new _core.defer();
			var _URL = window.URL || window.webkitURL || window.mozURL;
			var tempUrl;
			var response;
			var useBase64 = options && options.base64;

			if (url in this.urlCache) {
				deferred.resolve(this.urlCache[url]);
				return deferred.promise;
			}

			if (useBase64) {
				response = this.getBase64(url);

				if (response) {
					response.then(function (tempUrl) {

						this.urlCache[url] = tempUrl;
						deferred.resolve(tempUrl);
					}.bind(this));
				}
			} else {

				response = this.getBlob(url);

				if (response) {
					response.then(function (blob) {

						tempUrl = _URL.createObjectURL(blob);
						this.urlCache[url] = tempUrl;
						deferred.resolve(tempUrl);
					}.bind(this));
				}
			}

			if (!response) {
				deferred.reject({
					message: "File not found in storage: " + url,
					stack: new Error().stack
				});
			}

			return deferred.promise;
		}

		/**
   * Revoke Temp Url for a achive item
   * @param  {string} url url of the item in the store
   */

	}, {
		key: "revokeUrl",
		value: function revokeUrl(url) {
			var _URL = window.URL || window.webkitURL || window.mozURL;
			var fromCache = this.urlCache[url];
			if (fromCache) _URL.revokeObjectURL(fromCache);
		}
	}, {
		key: "destroy",
		value: function destroy() {
			var _URL = window.URL || window.webkitURL || window.mozURL;
			for (var fromCache in this.urlCache) {
				_URL.revokeObjectURL(fromCache);
			}
			this.urlCache = {};
			this.removeListeners();
		}
	}]);

	return Store;
}();

(0, _eventEmitter2.default)(Store.prototype);

exports.default = Store;
module.exports = exports["default"];