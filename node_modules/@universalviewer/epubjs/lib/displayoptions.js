"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require("./utils/core");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Open DisplayOptions Format Parser
 * @class
 * @param {document} displayOptionsDocument XML
 */
var DisplayOptions = function () {
	function DisplayOptions(displayOptionsDocument) {
		_classCallCheck(this, DisplayOptions);

		this.interactive = "";
		this.fixedLayout = "";
		this.openToSpread = "";
		this.orientationLock = "";

		if (displayOptionsDocument) {
			this.parse(displayOptionsDocument);
		}
	}

	/**
  * Parse XML
  * @param  {document} displayOptionsDocument XML
  * @return {DisplayOptions} self
  */


	_createClass(DisplayOptions, [{
		key: "parse",
		value: function parse(displayOptionsDocument) {
			var _this = this;

			if (!displayOptionsDocument) {
				return this;
			}

			var displayOptionsNode = (0, _core.qs)(displayOptionsDocument, "display_options");
			if (!displayOptionsNode) {
				return this;
			}

			var options = (0, _core.qsa)(displayOptionsNode, "option");
			options.forEach(function (el) {
				var value = "";

				if (el.childNodes.length) {
					value = el.childNodes[0].nodeValue;
				}

				switch (el.attributes.name.value) {
					case "interactive":
						_this.interactive = value;
						break;
					case "fixed-layout":
						_this.fixedLayout = value;
						break;
					case "open-to-spread":
						_this.openToSpread = value;
						break;
					case "orientation-lock":
						_this.orientationLock = value;
						break;
				}
			});

			return this;
		}
	}, {
		key: "destroy",
		value: function destroy() {
			this.interactive = undefined;
			this.fixedLayout = undefined;
			this.openToSpread = undefined;
			this.orientationLock = undefined;
		}
	}]);

	return DisplayOptions;
}();

exports.default = DisplayOptions;
module.exports = exports["default"];