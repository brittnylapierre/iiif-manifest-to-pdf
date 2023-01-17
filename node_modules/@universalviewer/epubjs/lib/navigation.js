"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require("./utils/core");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Navigation Parser
 * @param {document} xml navigation html / xhtml / ncx
 */
var Navigation = function () {
	function Navigation(xml) {
		_classCallCheck(this, Navigation);

		this.toc = [];
		this.tocByHref = {};
		this.tocById = {};

		this.landmarks = [];
		this.landmarksByType = {};

		this.length = 0;
		if (xml) {
			this.parse(xml);
		}
	}

	/**
  * Parse out the navigation items
  * @param {document} xml navigation html / xhtml / ncx
  */


	_createClass(Navigation, [{
		key: "parse",
		value: function parse(xml) {
			var isXml = xml.nodeType;
			var html = void 0;
			var ncx = void 0;

			if (isXml) {
				html = (0, _core.qs)(xml, "html");
				ncx = (0, _core.qs)(xml, "ncx");
			}

			if (!isXml) {
				this.toc = this.load(xml);
			} else if (html) {
				this.toc = this.parseNav(xml);
				this.landmarks = this.parseLandmarks(xml);
			} else if (ncx) {
				this.toc = this.parseNcx(xml);
			}

			this.length = 0;

			this.unpack(this.toc);
		}

		/**
   * Unpack navigation items
   * @private
   * @param  {array} toc
   */

	}, {
		key: "unpack",
		value: function unpack(toc) {
			var item;

			for (var i = 0; i < toc.length; i++) {
				item = toc[i];

				if (item.href) {
					this.tocByHref[item.href] = i;
				}

				if (item.id) {
					this.tocById[item.id] = i;
				}

				this.length++;

				if (item.subitems.length) {
					this.unpack(item.subitems);
				}
			}
		}

		/**
   * Get an item from the navigation
   * @param  {string} target
   * @return {object} navItem
   */

	}, {
		key: "get",
		value: function get(target) {
			var index;

			if (!target) {
				return this.toc;
			}

			if (target.indexOf("#") === 0) {
				index = this.tocById[target.substring(1)];
			} else if (target in this.tocByHref) {
				index = this.tocByHref[target];
			}

			return this.toc[index];
		}

		/**
   * Get a landmark by type
   * List of types: https://idpf.github.io/epub-vocabs/structure/
   * @param  {string} type
   * @return {object} landmarkItem
   */

	}, {
		key: "landmark",
		value: function landmark(type) {
			var index;

			if (!type) {
				return this.landmarks;
			}

			index = this.landmarksByType[type];

			return this.landmarks[index];
		}

		/**
   * Parse toc from a Epub > 3.0 Nav
   * @private
   * @param  {document} navHtml
   * @return {array} navigation list
   */

	}, {
		key: "parseNav",
		value: function parseNav(navHtml) {
			var navElement = (0, _core.querySelectorByType)(navHtml, "nav", "toc");
			var navItems = navElement ? (0, _core.qsa)(navElement, "li") : [];
			var length = navItems.length;
			var i;
			var toc = {};
			var list = [];
			var item, parent;

			if (!navItems || length === 0) return list;

			for (i = 0; i < length; ++i) {
				item = this.navItem(navItems[i]);
				if (item) {
					toc[item.id] = item;
					if (!item.parent) {
						list.push(item);
					} else {
						parent = toc[item.parent];
						parent.subitems.push(item);
					}
				}
			}

			return list;
		}

		/**
   * Create a navItem
   * @private
   * @param  {element} item
   * @return {object} navItem
   */

	}, {
		key: "navItem",
		value: function navItem(item) {
			var id = item.getAttribute("id") || undefined;
			var content = (0, _core.filterChildren)(item, "a", true);

			if (!content) {
				return;
			}

			var src = content.getAttribute("href") || "";

			if (!id) {
				id = src;
			}
			var text = content.textContent || "";
			var subitems = [];
			var parentItem = (0, _core.getParentByTagName)(item, "li");
			var parent = void 0;

			if (parentItem) {
				parent = parentItem.getAttribute("id");
				if (!parent) {
					var parentContent = (0, _core.filterChildren)(parentItem, "a", true);
					parent = parentContent && parentContent.getAttribute("href");
				}
			}

			while (!parent && parentItem) {
				parentItem = (0, _core.getParentByTagName)(parentItem, "li");
				if (parentItem) {
					parent = parentItem.getAttribute("id");
					if (!parent) {
						var _parentContent = (0, _core.filterChildren)(parentItem, "a", true);
						parent = _parentContent && _parentContent.getAttribute("href");
					}
				}
			}

			return {
				"id": id,
				"href": src,
				"label": text,
				"subitems": subitems,
				"parent": parent
			};
		}

		/**
   * Parse landmarks from a Epub > 3.0 Nav
   * @private
   * @param  {document} navHtml
   * @return {array} landmarks list
   */

	}, {
		key: "parseLandmarks",
		value: function parseLandmarks(navHtml) {
			var navElement = (0, _core.querySelectorByType)(navHtml, "nav", "landmarks");
			var navItems = navElement ? (0, _core.qsa)(navElement, "li") : [];
			var length = navItems.length;
			var i;
			var list = [];
			var item;

			if (!navItems || length === 0) return list;

			for (i = 0; i < length; ++i) {
				item = this.landmarkItem(navItems[i]);
				if (item) {
					list.push(item);
					this.landmarksByType[item.type] = i;
				}
			}

			return list;
		}

		/**
   * Create a landmarkItem
   * @private
   * @param  {element} item
   * @return {object} landmarkItem
   */

	}, {
		key: "landmarkItem",
		value: function landmarkItem(item) {
			var content = (0, _core.filterChildren)(item, "a", true);

			if (!content) {
				return;
			}

			var type = content.getAttributeNS("http://www.idpf.org/2007/ops", "type") || undefined;
			var href = content.getAttribute("href") || "";
			var text = content.textContent || "";

			return {
				"href": href,
				"label": text,
				"type": type
			};
		}

		/**
   * Parse from a Epub > 3.0 NC
   * @private
   * @param  {document} navHtml
   * @return {array} navigation list
   */

	}, {
		key: "parseNcx",
		value: function parseNcx(tocXml) {
			var navPoints = (0, _core.qsa)(tocXml, "navPoint");
			var length = navPoints.length;
			var i;
			var toc = {};
			var list = [];
			var item, parent;

			if (!navPoints || length === 0) return list;

			for (i = 0; i < length; ++i) {
				item = this.ncxItem(navPoints[i]);
				toc[item.id] = item;
				if (!item.parent) {
					list.push(item);
				} else {
					parent = toc[item.parent];
					parent.subitems.push(item);
				}
			}

			return list;
		}

		/**
   * Create a ncxItem
   * @private
   * @param  {element} item
   * @return {object} ncxItem
   */

	}, {
		key: "ncxItem",
		value: function ncxItem(item) {
			var id = item.getAttribute("id") || false,
			    content = (0, _core.qs)(item, "content"),
			    src = content.getAttribute("src"),
			    navLabel = (0, _core.qs)(item, "navLabel"),
			    text = navLabel.textContent ? navLabel.textContent : "",
			    subitems = [],
			    parentNode = item.parentNode,
			    parent;

			if (parentNode && (parentNode.nodeName === "navPoint" || parentNode.nodeName.split(':').slice(-1)[0] === "navPoint")) {
				parent = parentNode.getAttribute("id");
			}

			return {
				"id": id,
				"href": src,
				"label": text,
				"subitems": subitems,
				"parent": parent
			};
		}

		/**
   * Load Spine Items
   * @param  {object} json the items to be loaded
   * @return {Array} navItems
   */

	}, {
		key: "load",
		value: function load(json) {
			var _this = this;

			return json.map(function (item) {
				item.label = item.title;
				item.subitems = item.children ? _this.load(item.children) : [];
				return item;
			});
		}

		/**
   * forEach pass through
   * @param  {Function} fn function to run on each item
   * @return {method} forEach loop
   */

	}, {
		key: "forEach",
		value: function forEach(fn) {
			return this.toc.forEach(fn);
		}
	}]);

	return Navigation;
}();

exports.default = Navigation;
module.exports = exports["default"];