"use strict";(self.webpackChunkUV=self.webpackChunkUV||[]).push([[4226],{4503:(t,e,i)=>{i.d(e,{I:()=>r});var n,o=i(9979),s=i(8204),a=(n=function(t,e){return n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])},n(t,e)},function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function i(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)}),h=i(9755),r=function(t){function e(e){return t.call(this,e)||this}return a(e,t),e.prototype.create=function(){var e,i=this;this.setConfig("settingsDialogue"),t.prototype.create.call(this),this.openCommand=o.e.SHOW_SETTINGS_DIALOGUE,this.closeCommand=o.e.HIDE_SETTINGS_DIALOGUE,this.extensionHost.subscribe(this.openCommand,(function(t){e=t,i.open()})),this.extensionHost.subscribe(this.closeCommand,(function(){e&&e.focus(),i.close()})),this.$title=h('<div role="heading" class="heading"></div>'),this.$content.append(this.$title),this.$scroll=h('<div class="scroll"></div>'),this.$content.append(this.$scroll),this.$version=h('<div class="version"></div>'),this.$content.append(this.$version),this.$website=h('<div class="website"></div>'),this.$content.append(this.$website),this.$locale=h('<div class="setting locale"></div>'),this.$scroll.append(this.$locale),this.$localeLabel=h('<label for="locale">'+this.content.locale+"</label>"),this.$locale.append(this.$localeLabel),this.$localeDropDown=h('<select id="locale"></select>'),this.$locale.append(this.$localeDropDown),this.$title.text(this.content.title),this.$website.html(this.content.website),this.$website.targetBlank(),this._createLocalesMenu(),this._createAccessibilityMenu(),this.$element.hide()},e.prototype.getSettings=function(){return this.extension.getSettings()},e.prototype.updateSettings=function(t){this.extension.updateSettings(t),this.extensionHost.publish(o.e.UPDATE_SETTINGS,t)},e.prototype.open=function(){t.prototype.open.call(this),this.$version.text("v4.0.0-pre.77")},e.prototype._createLocalesMenu=function(){var t=this,e=this.extension.data.locales;if(e&&e.length>1){for(var i=0;i<e.length;i++){var n=e[i];this.$localeDropDown.append('<option value="'+n.name+'">'+n.label+"</option>")}this.$localeDropDown.val(e[0].name)}else this.$locale.hide();this.$localeDropDown.change((function(){t.extension.changeLocale(t.$localeDropDown.val())}))},e.prototype.resize=function(){t.prototype.resize.call(this)},e.prototype._createAccessibilityMenu=function(){var t=this;this.$reducedAnimation=h('<div class="setting reducedAnimation"></div>'),this.$scroll.append(this.$reducedAnimation),this.$reducedAnimationCheckbox=h('<input id="reducedAnimation" type="checkbox" tabindex="0" />'),this.$reducedAnimation.append(this.$reducedAnimationCheckbox),this.$reducedAnimationLabel=h('<label for="reducedAnimation">'+this.content.reducedMotion+"</label>"),this.$reducedAnimation.append(this.$reducedAnimationLabel),this.$reducedAnimationCheckbox.change((function(){var e={};t.$reducedAnimationCheckbox.is(":checked")?e.reducedAnimation=!0:e.reducedAnimation=!1,t.updateSettings(e)}))},e}(s.i)},7695:(t,e,i)=>{i.d(e,{C:()=>l});var n,o=i(9979),s=i(8204),a=i(6783),h=(n=function(t,e){return n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])},n(t,e)},function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function i(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)}),r=i(9755),l=function(t){function e(e){var i=t.call(this,e)||this;return i.aspectRatio=.75,i.isEmbedViewVisible=!1,i.isShareViewVisible=!1,i.maxWidth=8e3,i.maxHeight=i.maxWidth*i.aspectRatio,i.minWidth=200,i.minHeight=i.minWidth*i.aspectRatio,i.shareManifestsEnabled=!1,i}return h(e,t),e.prototype.create=function(){var e,i=this;this.setConfig("shareDialogue"),t.prototype.create.call(this),this.openCommand=o.e.SHOW_SHARE_DIALOGUE,this.closeCommand=o.e.HIDE_SHARE_DIALOGUE,this.shareManifestsEnabled=this.options.shareManifestsEnabled||!1,this.extensionHost.subscribe(this.openCommand,(function(t){e=t,i.open(t),i.isShareAvailable()?i.openShareView():i.openEmbedView()})),this.extensionHost.subscribe(this.closeCommand,(function(){e&&e.focus(),i.close()})),this.extensionHost.subscribe(o.e.SHOW_EMBED_DIALOGUE,(function(t){i.open(t),i.openEmbedView()})),this.$tabs=r('<div class="tabs"></div>'),this.$content.append(this.$tabs),this.$shareButton=r('<a class="share tab default" tabindex="0">'+this.content.share+"</a>"),this.$tabs.append(this.$shareButton),this.$embedButton=r('<a class="embed tab" tabindex="0">'+this.content.embed+"</a>"),this.$tabs.append(this.$embedButton),this.$tabsContent=r('<div class="tabsContent"></div>'),this.$content.append(this.$tabsContent),this.$footer=r('<div class="footer"></div>'),this.$content.append(this.$footer),this.$shareView=r('<div class="shareView view"></div>'),this.$tabsContent.append(this.$shareView),this.$shareHeader=r('<div class="header"></div>'),this.$shareView.append(this.$shareHeader),this.$shareLink=r('<a class="shareLink" onclick="return false;"></a>'),this.$shareView.append(this.$shareLink),this.$shareInput=r('<input class="shareInput" type="text" readonly="readonly" aria-label="'+this.content.shareUrl+'"/>'),this.$shareView.append(this.$shareInput),this.$shareFrame=r('<iframe class="shareFrame"></iframe>'),this.$shareView.append(this.$shareFrame),this.$embedView=r('<div class="embedView view"></div>'),this.$tabsContent.append(this.$embedView),this.$embedHeader=r('<div class="header"></div>'),this.$embedView.append(this.$embedHeader),this.$code=r('<input class="code" type="text" readonly="readonly" aria-label="'+this.content.embed+'"/>'),this.$embedView.append(this.$code),this.$customSize=r('<div class="customSize"></div>'),this.$embedView.append(this.$customSize),this.$size=r('<span class="size">'+this.content.size+"</span>"),this.$customSize.append(this.$size),this.$customSizeDropDown=r('<select id="size" aria-label="'+this.content.size+'"></select>'),this.$customSize.append(this.$customSizeDropDown),this.$customSizeDropDown.append('<option value="small" data-width="560" data-height="420">560 x 420</option>'),this.$customSizeDropDown.append('<option value="medium" data-width="640" data-height="480">640 x 480</option>'),this.$customSizeDropDown.append('<option value="large" data-width="800" data-height="600">800 x 600</option>'),this.$customSizeDropDown.append('<option value="custom">'+this.content.customSize+"</option>"),this.$widthInput=r('<input class="width" type="text" maxlength="10" aria-label="'+this.content.width+'"/>'),this.$customSize.append(this.$widthInput),this.$x=r('<span class="x">x</span>'),this.$customSize.append(this.$x),this.$heightInput=r('<input class="height" type="text" maxlength="10" aria-label="'+this.content.height+'"/>'),this.$customSize.append(this.$heightInput);var n=this.extension.getIIIFShareUrl(this.shareManifestsEnabled);this.shareManifestsEnabled&&(this.$iiifButton=r('<a class="imageBtn iiif" href="'+n+'" title="'+this.content.iiif+'" target="_blank"></a>'),this.$footer.append(this.$iiifButton)),this.$termsOfUseButton=r('<a href="#">'+this.extension.data.config.content.termsOfUse+"</a>"),this.$footer.append(this.$termsOfUseButton),this.$widthInput.on("keydown",(function(t){return a.uI.numericalInput(t)})),this.$heightInput.on("keydown",(function(t){return a.uI.numericalInput(t)})),this.$shareInput.focus((function(){r(this).select()})),this.$code.focus((function(){r(this).select()})),this.onAccessibleClick(this.$shareButton,(function(){i.openShareView()})),this.onAccessibleClick(this.$embedButton,(function(){i.openEmbedView()})),this.$customSizeDropDown.change((function(){i.update()})),this.$widthInput.change((function(){i.updateHeightRatio(),i.update()})),this.$heightInput.change((function(){i.updateWidthRatio(),i.update()})),this.onAccessibleClick(this.$termsOfUseButton,(function(){i.extensionHost.publish(o.e.SHOW_TERMS_OF_USE)})),this.$element.hide(),this.update()},e.prototype.open=function(e){t.prototype.open.call(this,e),this.update()},e.prototype.getShareUrl=function(){return this.extension.getShareUrl()},e.prototype.isShareAvailable=function(){return!!this.getShareUrl()},e.prototype.update=function(){this.isShareAvailable()?this.$shareButton.show():this.$shareButton.hide();var t=this.getSelectedSize();"custom"===t.val()?(this.$widthInput.show(),this.$x.show(),this.$heightInput.show()):(this.$widthInput.hide(),this.$x.hide(),this.$heightInput.hide(),this.currentWidth=Number(t.data("width")),this.currentHeight=Number(t.data("height")),this.$widthInput.val(String(this.currentWidth)),this.$heightInput.val(String(this.currentHeight))),this.updateInstructions(),this.updateShareOptions(),this.updateShareFrame(),this.updateTermsOfUseButton()},e.prototype.updateShareOptions=function(){var t=this.getShareUrl();t&&(this.$shareInput.val(t),this.$shareLink.prop("href",t),this.$shareLink.text(t)),this.extension.isMobile()?(this.$shareInput.hide(),this.$shareLink.show()):(this.$shareInput.show(),this.$shareLink.hide())},e.prototype.updateInstructions=function(){a.RS.getBool(this.options.instructionsEnabled,!1)?(this.$shareHeader.show(),this.$embedHeader.show(),this.$shareHeader.text(this.content.shareInstructions),this.$embedHeader.text(this.content.embedInstructions)):(this.$shareHeader.hide(),this.$embedHeader.hide())},e.prototype.getSelectedSize=function(){return this.$customSizeDropDown.find(":selected")},e.prototype.updateWidthRatio=function(){this.currentHeight=Number(this.$heightInput.val()),this.currentHeight<this.minHeight?(this.currentHeight=this.minHeight,this.$heightInput.val(String(this.currentHeight))):this.currentHeight>this.maxHeight&&(this.currentHeight=this.maxHeight,this.$heightInput.val(String(this.currentHeight))),this.currentWidth=Math.floor(this.currentHeight/this.aspectRatio),this.$widthInput.val(String(this.currentWidth))},e.prototype.updateHeightRatio=function(){this.currentWidth=Number(this.$widthInput.val()),this.currentWidth<this.minWidth?(this.currentWidth=this.minWidth,this.$widthInput.val(String(this.currentWidth))):this.currentWidth>this.maxWidth&&(this.currentWidth=this.maxWidth,this.$widthInput.val(String(this.currentWidth))),this.currentHeight=Math.floor(this.currentWidth*this.aspectRatio),this.$heightInput.val(String(this.currentHeight))},e.prototype.updateShareFrame=function(){var t=this.extension.helper.getShareServiceUrl();t&&(a.RS.getBool(this.config.options.shareFrameEnabled,!0)&&t?(this.$shareFrame.prop("src",t),this.$shareFrame.show()):this.$shareFrame.hide())},e.prototype.updateTermsOfUseButton=function(){var t=this.extension.helper.getRequiredStatement();a.RS.getBool(this.extension.data.config.options.termsOfUseEnabled,!1)&&t&&t.value?this.$termsOfUseButton.show():this.$termsOfUseButton.hide()},e.prototype.openShareView=function(){this.isShareViewVisible=!0,this.isEmbedViewVisible=!1,this.$embedView.hide(),this.$shareView.show(),this.$shareButton.addClass("on default"),this.$embedButton.removeClass("on default"),this.resize()},e.prototype.openEmbedView=function(){this.isShareViewVisible=!1,this.isEmbedViewVisible=!0,this.$embedView.show(),this.$shareView.hide(),this.$shareButton.removeClass("on default"),this.$embedButton.addClass("on default"),this.resize()},e.prototype.close=function(){t.prototype.close.call(this)},e.prototype.getViews=function(){return this.$tabsContent.find(".view")},e.prototype.equaliseViewHeights=function(){this.getViews().equaliseHeight(!0)},e.prototype.resize=function(){this.equaliseViewHeights(),this.setDockedPosition()},e}(s.i)},4092:(t,e,i)=>{i.d(e,{F:()=>f});var n,o=i(9979),s=i(7502),a=i(6783),h=(n=function(t,e){return n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])},n(t,e)},function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function i(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)}),r=function(t){function e(e){return t.call(this,e)||this}return h(e,t),e.prototype.create=function(){t.prototype.create.call(this),this.$element.width(this.options.panelCollapsedWidth)},e.prototype.init=function(){var e=this;t.prototype.init.call(this),a.RS.getBool(this.extension.getSettings().rightPanelOpen,this.options.panelOpen)&&this.toggle(!0),this.extensionHost.subscribe(o.e.TOGGLE_EXPAND_RIGHT_PANEL,(function(){e.isFullyExpanded?e.collapseFull():e.expandFull()}))},e.prototype.getTargetWidth=function(){return this.isExpanded?this.options.panelCollapsedWidth:this.options.panelExpandedWidth},e.prototype.getTargetLeft=function(){return this.isExpanded?this.$element.parent().width()-this.options.panelCollapsedWidth:this.$element.parent().width()-this.options.panelExpandedWidth},e.prototype.toggleFinish=function(){t.prototype.toggleFinish.call(this),this.isExpanded?this.extensionHost.publish(o.e.OPEN_RIGHT_PANEL):this.extensionHost.publish(o.e.CLOSE_RIGHT_PANEL),this.extension.updateSettings({rightPanelOpen:this.isExpanded})},e.prototype.resize=function(){t.prototype.resize.call(this),this.$element.css({left:Math.floor(this.$element.parent().width()-this.$element.outerWidth())})},e}(s.Y),l=i(8675),p=i(8939),c=i(4114),u=function(){var t=function(e,i){return t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])},t(e,i)};return function(e,i){if("function"!=typeof i&&null!==i)throw new TypeError("Class extends value "+String(i)+" is not a constructor or null");function n(){this.constructor=e}t(e,i),e.prototype=null===i?Object.create(i):(n.prototype=i.prototype,new n)}}(),d=i(9755),f=function(t){function e(e){return t.call(this,e)||this}return u(e,t),e.prototype.create=function(){var e=this;this.setConfig("moreInfoRightPanel"),t.prototype.create.call(this),this.extensionHost.subscribe(o.e.CANVAS_INDEX_CHANGE,(function(){e.databind()})),this.extensionHost.subscribe(o.e.RANGE_CHANGE,(function(){e.databind()})),this.setTitle(this.config.content.title),this.$metadata=d('<div class="iiif-metadata-component"></div>'),this.$main.append(this.$metadata),this.metadataComponent=new c.MetadataComponent({target:this.$metadata[0],data:this._getData()}),this.metadataComponent.on("iiifViewerLinkClicked",(function(t){var i=a.nn.getHashParameterFromString("rid",t);if(i){var n=e.extension.helper.getRangeById(i);n&&e.extensionHost.publish(o.e.RANGE_CHANGE,n)}}),!1)},e.prototype.toggleFinish=function(){t.prototype.toggleFinish.call(this),this.databind()},e.prototype.databind=function(){this.metadataComponent.set(this._getData())},e.prototype._getCurrentRange=function(){return this.extension.helper.getCurrentRange()},e.prototype._getData=function(){return{canvasDisplayOrder:this.config.options.canvasDisplayOrder,canvases:this.extension.getCurrentCanvases(),canvasExclude:this.config.options.canvasExclude,canvasLabels:this.extension.getCanvasLabels(this.content.page),content:this.config.content,copiedMessageDuration:2e3,copyToClipboardEnabled:a.RS.getBool(this.config.options.copyToClipboardEnabled,!1),helper:this.extension.helper,licenseFormatter:new p.x0(this.config.license?this.config.license:{}),limit:this.config.options.textLimit||4,limitType:c.LimitType.LINES,limitToRange:a.RS.getBool(this.config.options.limitToRange,!1),manifestDisplayOrder:this.config.options.manifestDisplayOrder,manifestExclude:this.config.options.manifestExclude,range:this._getCurrentRange(),rtlLanguageCodes:this.config.options.rtlLanguageCodes,sanitizer:function(t){return(0,l.Nw)(t)},showAllLanguages:this.config.options.showAllLanguages}},e.prototype.resize=function(){t.prototype.resize.call(this),this.$main.height(this.$element.height()-this.$top.height()-this.$main.verticalMargins())},e}(r)},7502:(t,e,i)=>{i.d(e,{Y:()=>l});var n,o=i(298),s=i(6783),a=i(9979),h=(n=function(t,e){return n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])},n(t,e)},function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function i(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)}),r=i(9755),l=function(t){function e(e){var i=t.call(this,e,!1,!0)||this;return i.isExpanded=!1,i.isFullyExpanded=!1,i.isUnopened=!0,i.autoToggled=!1,i.expandFullEnabled=!0,i.reducedAnimation=!1,i}return h(e,t),e.prototype.create=function(){var e=this;t.prototype.create.call(this),this.$top=r('<div class="top"></div>'),this.$element.append(this.$top),this.$title=r('<h2 class="title"></h2>'),this.$top.append(this.$title),this.$expandFullButton=r('<a class="expandFullButton" tabindex="0"></a>'),this.$top.append(this.$expandFullButton),s.RS.getBool(this.config.options.expandFullEnabled,!0)||this.$expandFullButton.hide(),this.$collapseButton=r('<div role="button" class="collapseButton" tabindex="0"></div>'),this.$collapseButton.prop("title",this.content.collapse),this.$top.append(this.$collapseButton),this.$closed=r('<div class="closed"></div>'),this.$element.append(this.$closed),this.$expandButton=r('<a role="button" class="expandButton" tabindex="0"></a>'),this.$expandButton.prop("title",this.content.expand),this.$closed.append(this.$expandButton),this.$closedTitle=r('<a class="title"></a>'),this.$closed.append(this.$closedTitle),this.$main=r('<div class="main"></div>'),this.$element.append(this.$main),this.onAccessibleClick(this.$expandButton,(function(){e.toggle()})),this.$expandFullButton.on("click",(function(){e.expandFull()})),this.$closedTitle.on("click",(function(){e.toggle()})),this.$title.on("click",(function(){e.isFullyExpanded?e.collapseFull():e.toggle()})),this.onAccessibleClick(this.$collapseButton,(function(){e.isFullyExpanded?e.collapseFull():e.toggle()})),this.$top.hide(),this.$main.hide(),this.extensionHost.subscribe(a.e.SETTINGS_CHANGE,(function(t){e.reducedAnimation=t.reducedAnimation||!1}))},e.prototype.init=function(){t.prototype.init.call(this)},e.prototype.setTitle=function(t){this.$title.text(t),this.$closedTitle.text(t)},e.prototype.toggle=function(t){var e=this;this.autoToggled=!!t,this.isExpanded&&(this.$top.attr("aria-hidden","true"),this.$main.attr("aria-hidden","true"),this.$closed.attr("aria-hidden","false"),this.$top.hide(),this.$main.hide(),this.$closed.show()),this.reducedAnimation?(this.$element.css("width",this.getTargetWidth()),this.$element.css("left",this.getTargetLeft()),this.toggled()):this.$element.stop().animate({width:this.getTargetWidth(),left:this.getTargetLeft()},this.options.panelAnimationDuration,(function(){e.toggled()}))},e.prototype.toggled=function(){this.toggleStart(),this.isExpanded=!this.isExpanded,this.isExpanded&&(this.$top.attr("aria-hidden","false"),this.$main.attr("aria-hidden","false"),this.$closed.attr("aria-hidden","true"),this.$closed.hide(),this.$top.show(),this.$main.show()),this.toggleFinish(),this.isUnopened=!1},e.prototype.expandFull=function(){var t=this;this.isExpanded||this.toggled();var e=this.getFullTargetWidth(),i=this.getFullTargetLeft();this.expandFullStart(),this.$element.stop().animate({width:e,left:i},this.options.panelAnimationDuration,(function(){t.expandFullFinish()}))},e.prototype.collapseFull=function(){var t=this,e=this.getTargetWidth(),i=this.getTargetLeft();this.collapseFullStart(),this.$element.stop().animate({width:e,left:i},this.options.panelAnimationDuration,(function(){t.collapseFullFinish()}))},e.prototype.getTargetWidth=function(){return 0},e.prototype.getTargetLeft=function(){return 0},e.prototype.getFullTargetWidth=function(){return 0},e.prototype.getFullTargetLeft=function(){return 0},e.prototype.toggleStart=function(){},e.prototype.toggleFinish=function(){this.isExpanded&&!this.autoToggled?this.focusCollapseButton():this.focusExpandButton()},e.prototype.expandFullStart=function(){},e.prototype.expandFullFinish=function(){this.isFullyExpanded=!0,this.$expandFullButton.hide(),this.focusCollapseButton()},e.prototype.collapseFullStart=function(){},e.prototype.collapseFullFinish=function(){this.isFullyExpanded=!1,this.expandFullEnabled&&this.$expandFullButton.show(),this.focusExpandFullButton()},e.prototype.focusExpandButton=function(){var t=this;setTimeout((function(){t.$expandButton.focus()}),1)},e.prototype.focusExpandFullButton=function(){var t=this;setTimeout((function(){t.$expandFullButton.focus()}),1)},e.prototype.focusCollapseButton=function(){var t=this;setTimeout((function(){t.$collapseButton.focus()}),1)},e.prototype.resize=function(){t.prototype.resize.call(this),this.$main.height(this.$element.parent().height()-this.$top.outerHeight(!0))},e}(o.P)},9079:(t,e,i)=>{i.d(e,{o:()=>l});var n,o=i(9979),s=i(298),a=i(6783),h=(n=function(t,e){return n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])},n(t,e)},function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function i(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)}),r=i(9755),l=function(t){function e(e){return t.call(this,e)||this}return h(e,t),e.prototype.create=function(){var e=this;this.setConfig("footerPanel"),t.prototype.create.call(this),this.extensionHost.subscribe(o.e.TOGGLE_FULLSCREEN,(function(){e.updateFullScreenButton(),e.extensionHost.isFullScreen||setTimeout((function(){e.resize()}),1001)})),this.extensionHost.subscribe(o.e.METRIC_CHANGE,(function(){e.updateMinimisedButtons(),e.updateMoreInfoButton()})),this.extensionHost.subscribe(o.e.SETTINGS_CHANGE,(function(){e.updateDownloadButton()})),this.$options=r('<div class="options"></div>'),this.$element.append(this.$options),this.$feedbackButton=r('\n          <button class="feedback btn imageBtn" title="'+this.content.feedback+'">\n            <i class="uv-icon uv-icon-feedback" aria-hidden="true"></i>\n            <span class="sr-only">'+this.content.feedback+"</span>\n          </button>\n        "),this.$options.prepend(this.$feedbackButton),this.$openButton=r('\n          <button class="open btn imageBtn" title="'+this.content.open+'">\n            <i class="uv-icon-open" aria-hidden="true"></i>\n            <span class="sr-only">'+this.content.open+"</span>\n          </button>\n        "),this.$options.prepend(this.$openButton),this.$bookmarkButton=r('\n          <button class="bookmark btn imageBtn" title="'+this.content.bookmark+'">\n            <i class="uv-icon uv-icon-bookmark" aria-hidden="true"></i>\n            <span class="sr-only">'+this.content.bookmark+"</span>\n          </button>\n        "),this.$options.prepend(this.$bookmarkButton),this.$shareButton=r('\n          <button class="share btn imageBtn" title="'+this.content.share+'">\n            <i class="uv-icon uv-icon-share" aria-hidden="true"></i>\n            <span class="sr-only">'+this.content.share+"</span>\n          </button>\n        "),this.$options.append(this.$shareButton),this.$embedButton=r('\n          <button class="embed btn imageBtn" title="'+this.content.embed+'">\n            <i class="uv-icon uv-icon-embed" aria-hidden="true"></i>\n            <span class="sr-only">'+this.content.embed+"</span>\n          </button>\n        "),this.$options.append(this.$embedButton),this.$downloadButton=r('\n          <button class="download btn imageBtn" title="'+this.content.download+'" id="download-btn">\n            <i class="uv-icon uv-icon-download" aria-hidden="true"></i>\n            <span class="sr-only">'+this.content.download+"</span>\n          </button>\n        "),this.$options.prepend(this.$downloadButton),this.$moreInfoButton=r('\n          <button class="moreInfo btn imageBtn" title="'+this.content.moreInfo+'">\n            <i class="uv-icon uv-icon-more-info" aria-hidden="true"></i>\n            <span class="sr-only">'+this.content.moreInfo+"</span>\n          </button>\n        "),this.$options.prepend(this.$moreInfoButton),this.$fullScreenBtn=r('\n          <button class="fullScreen btn imageBtn" title="'+this.content.fullScreen+'">\n            <i class="uv-icon uv-icon-fullscreen" aria-hidden="true"></i>\n            <span class="sr-only">'+this.content.fullScreen+"</span>\n          </button>\n        "),this.$options.append(this.$fullScreenBtn),this.$openButton.onPressed((function(){e.extensionHost.publish(o.e.OPEN)})),this.$feedbackButton.onPressed((function(){e.extensionHost.publish(o.e.FEEDBACK)})),this.$bookmarkButton.onPressed((function(){e.extensionHost.publish(o.e.BOOKMARK)})),this.$shareButton.onPressed((function(){e.extensionHost.publish(o.e.SHOW_SHARE_DIALOGUE,e.$shareButton)})),this.$embedButton.onPressed((function(){e.extensionHost.publish(o.e.SHOW_EMBED_DIALOGUE,e.$embedButton)})),this.$downloadButton.onPressed((function(){e.extensionHost.publish(o.e.SHOW_DOWNLOAD_DIALOGUE,e.$downloadButton)})),this.$moreInfoButton.onPressed((function(){e.extensionHost.publish(o.e.SHOW_MOREINFO_DIALOGUE,e.$moreInfoButton)})),this.onAccessibleClick(this.$fullScreenBtn,(function(t){t.preventDefault(),e.extensionHost.publish(o.e.TOGGLE_FULLSCREEN)}),!0),a.RS.getBool(this.options.embedEnabled,!0)||this.$embedButton.hide(),this.updateMoreInfoButton(),this.updateOpenButton(),this.updateFeedbackButton(),this.updateBookmarkButton(),this.updateEmbedButton(),this.updateDownloadButton(),this.updateFullScreenButton(),this.updateShareButton(),this.updateMinimisedButtons()},e.prototype.updateMinimisedButtons=function(){a.RS.getBool(this.options.minimiseButtons,!1)?this.$options.addClass("minimiseButtons"):this.extension.isDesktopMetric()?this.$options.removeClass("minimiseButtons"):this.$options.addClass("minimiseButtons")},e.prototype.updateMoreInfoButton=function(){},e.prototype.updateOpenButton=function(){a.RS.getBool(this.options.openEnabled,!1)&&a.d2.isInIFrame()?this.$openButton.show():this.$openButton.hide()},e.prototype.updateFullScreenButton=function(){a.RS.getBool(this.options.fullscreenEnabled,!0)&&a.d2.supportsFullscreen()?this.extension.isFullScreen()?(this.$fullScreenBtn.switchClass("fullScreen","exitFullscreen"),this.$fullScreenBtn.find("i").switchClass("uv-icon-fullscreen","uv-icon-exit-fullscreen"),this.$fullScreenBtn.attr("title",this.content.exitFullScreen),r(this.$fullScreenBtn[0].firstChild.nextSibling.nextSibling).replaceWith(this.content.exitFullScreen)):(this.$fullScreenBtn.switchClass("exitFullscreen","fullScreen"),this.$fullScreenBtn.find("i").switchClass("uv-icon-exit-fullscreen","uv-icon-fullscreen"),this.$fullScreenBtn.attr("title",this.content.fullScreen),r(this.$fullScreenBtn[0].firstChild.nextSibling.nextSibling).replaceWith(this.content.fullScreen)):this.$fullScreenBtn.hide()},e.prototype.updateEmbedButton=function(){this.extension.helper.isUIEnabled("embed")&&a.RS.getBool(this.options.embedEnabled,!1)?this.extension.isMobile()||this.$embedButton.show():this.$embedButton.hide()},e.prototype.updateShareButton=function(){this.extension.helper.isUIEnabled("share")&&a.RS.getBool(this.options.shareEnabled,!0)?this.$shareButton.show():this.$shareButton.hide()},e.prototype.updateDownloadButton=function(){a.RS.getBool(this.options.downloadEnabled,!0)?this.$downloadButton.show():this.$downloadButton.hide()},e.prototype.updateFeedbackButton=function(){a.RS.getBool(this.options.feedbackEnabled,!1)?this.$feedbackButton.show():this.$feedbackButton.hide()},e.prototype.updateBookmarkButton=function(){a.RS.getBool(this.options.bookmarkEnabled,!1)?this.$bookmarkButton.show():this.$bookmarkButton.hide()},e.prototype.resize=function(){t.prototype.resize.call(this)},e}(s.P)},1522:(t,e,i)=>{i.d(e,{y:()=>f});var n,o=i(9979),s=i(298),a=function(t,e){this.message=t,this.actions=e},h=function(){},r=i(7102),l=function(){function t(t){this.extension=t}return t.prototype.Get=function(t){var e=this;switch(t.informationType){case r.V.AUTH_CORS_ERROR:return new a(this.extension.data.config.content.authCORSError,[]);case r.V.DEGRADED_RESOURCE:var i=[],n=new h,s=t.param.loginService.getConfirmLabel();s||(s=this.extension.data.config.content.fallbackDegradedLabel),n.label=s;var l=t.param;n.action=function(){l.authHoldingPage=window.open("","_blank"),e.extension.extensionHost.publish(o.e.HIDE_INFORMATION),e.extension.extensionHost.publish(o.e.OPEN_EXTERNAL_RESOURCE,[[l]])},i.push(n);var p=t.param.loginService.getServiceLabel();return p||(p=this.extension.data.config.content.fallbackDegradedMessage),new a(p,i)}},t}(),p=i(6783),c=i(8675),u=(n=function(t,e){return n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])},n(t,e)},function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function i(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)}),d=i(9755),f=function(t){function e(e){return t.call(this,e,!1,!1)||this}return u(e,t),e.prototype.create=function(){var e=this;this.setConfig("headerPanel"),t.prototype.create.call(this),this.extensionHost.subscribe(o.e.SHOW_INFORMATION,(function(t){e.showInformation(t)})),this.extensionHost.subscribe(o.e.HIDE_INFORMATION,(function(){e.hideInformation()})),this.$options=d('<div class="options"></div>'),this.$element.append(this.$options),this.$centerOptions=d('<div class="centerOptions"></div>'),this.$options.append(this.$centerOptions),this.$rightOptions=d('<div class="rightOptions"></div>'),this.$options.append(this.$rightOptions),this.$localeToggleButton=d('<a class="localeToggle" tabindex="0"></a>'),this.$rightOptions.append(this.$localeToggleButton),this.$settingsButton=d('\n          <button class="btn imageBtn settings" tabindex="0" title="'+this.content.settings+'">\n            <i class="uv-icon-settings" aria-hidden="true"></i>\n          </button>\n        '),this.$settingsButton.attr("title",this.content.settings),this.$rightOptions.append(this.$settingsButton),this.$informationBox=d('<div class="informationBox" aria-hidden="true">                                     <div class="message"></div>                                     <div class="actions"></div>                                     <button type="button" class="close" aria-label="Close">                                         <span aria-hidden="true">&#215;</span>                                    </button>                                   </div>'),this.$element.append(this.$informationBox),this.$informationBox.hide(),this.$informationBox.find(".close").attr("title",this.content.close),this.$informationBox.find(".close").on("click",(function(t){t.preventDefault(),e.extensionHost.publish(o.e.HIDE_INFORMATION)})),this.$localeToggleButton.on("click",(function(){e.extension.changeLocale(String(e.$localeToggleButton.data("locale")))})),this.$settingsButton.onPressed((function(){e.extensionHost.publish(o.e.SHOW_SETTINGS_DIALOGUE,e.$settingsButton)})),p.RS.getBool(this.options.centerOptionsEnabled,!0)||this.$centerOptions.hide(),this.updateLocaleToggle(),this.updateSettingsButton()},e.prototype.updateLocaleToggle=function(){if(this.localeToggleIsVisible()){var t=this.extension.getAlternateLocale(),e=t.name.split("-")[0].toUpperCase();this.$localeToggleButton.data("locale",t.name),this.$localeToggleButton.attr("title",t.label),this.$localeToggleButton.text(e)}else this.$localeToggleButton.hide()},e.prototype.updateSettingsButton=function(){p.RS.getBool(this.options.settingsButtonEnabled,!0)?this.$settingsButton.show():this.$settingsButton.hide()},e.prototype.localeToggleIsVisible=function(){var t=this.extension.data.locales;return!!t&&t.length>1&&p.RS.getBool(this.options.localeToggleEnabled,!1)},e.prototype.showInformation=function(t){var e=new l(this.extension);this.information=e.Get(t),this.$informationBox.find(".message").html(this.information.message).find("a").attr("target","_top");var i=this.$informationBox.find(".actions");i.empty();for(var n=0;n<this.information.actions.length;n++){var o=this.information.actions[n],s=d('<a href="#" class="btn btn-default">'+o.label+"</a>");s.on("click",o.action),i.append(s)}this.$informationBox.attr("aria-hidden","false"),this.$informationBox.show(),this.$element.addClass("showInformation"),this.extension.resize()},e.prototype.hideInformation=function(){this.$element.removeClass("showInformation"),this.$informationBox.attr("aria-hidden","true"),this.$informationBox.hide(),this.extension.resize()},e.prototype.getSettings=function(){return this.extension.getSettings()},e.prototype.updateSettings=function(t){this.extension.updateSettings(t),this.extensionHost.publish(o.e.UPDATE_SETTINGS,t)},e.prototype.resize=function(){t.prototype.resize.call(this);var e=this.$element.width()/2-this.$centerOptions.outerWidth()/2;if(this.$centerOptions.css({left:e}),(0,c.pn)(this.$informationBox)){var i=this.$informationBox.find(".actions"),n=this.$informationBox.find(".message");n.width(Math.floor(this.$element.width())-Math.ceil(n.horizontalMargins())-Math.ceil(i.outerWidth(!0))-Math.ceil(this.$informationBox.find(".close").outerWidth(!0))-2),this.information&&n.text(this.information.message)}this.extension.width()<this.extension.data.config.options.minWidthBreakPoint?this.localeToggleIsVisible()&&this.$localeToggleButton.hide():this.localeToggleIsVisible()&&this.$localeToggleButton.show()},e}(s.P)},5670:(t,e,i)=>{i.d(e,{W:()=>r});var n,o=i(9979),s=i(7502),a=i(6783),h=(n=function(t,e){return n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])},n(t,e)},function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function i(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)}),r=function(t){function e(e){return t.call(this,e)||this}return h(e,t),e.prototype.create=function(){var e=this;t.prototype.create.call(this),this.$element.width(this.options.panelCollapsedWidth),this.extensionHost.subscribe(o.e.TOGGLE_EXPAND_LEFT_PANEL,(function(){e.isFullyExpanded?e.collapseFull():e.expandFull()}))},e.prototype.init=function(){t.prototype.init.call(this),a.RS.getBool(this.extension.getSettings().leftPanelOpen,this.options.panelOpen)&&this.toggle(!0)},e.prototype.getTargetWidth=function(){return this.isFullyExpanded||!this.isExpanded?this.options.panelExpandedWidth:this.options.panelCollapsedWidth},e.prototype.getFullTargetWidth=function(){return this.$element.parent().width()},e.prototype.toggleFinish=function(){t.prototype.toggleFinish.call(this),this.isExpanded?this.extensionHost.publish(o.e.OPEN_LEFT_PANEL):this.extensionHost.publish(o.e.CLOSE_LEFT_PANEL),this.extension.updateSettings({leftPanelOpen:this.isExpanded})},e.prototype.resize=function(){t.prototype.resize.call(this),this.isFullyExpanded&&this.$element.width(this.$element.parent().width())},e}(s.Y)}}]);