var Q      = require('q')
,   logger = require('./logging').getLogger(__LOGGER__)

var {PAGE_CONTENT_NODE_ID} = require('./constants');

// Cover the whole viewport.
var FRAME_STYLE = {
	'border'   : '0px',
	'position' : 'absolute',
	'top'      : '0px',
	'left'     : '0px',
	'width'    : '100%',
	'height'   : '100%',
	'display'  : 'block',
	'zIndex'   : '10',
}

class FramebackController {

	constructor() {
		this.active = false;
	}

	isActive(){
		return this.active;
	}

	navigateTo(url){
		logger.debug(`Navigating to ${url}`);

		this.active = true;

		this.hideMaster();

		if (url !== this.url){
			// We, unfortunately, can't just point the existing
			// frame at a new page since that would be a
			// navigation.  So, we'll destroy it and create a
			// fresh replacement.
			if (this.frame){
				this.destroyFrame();
			}
			this.createFrame(url);
		}
		this.showFrame();

		// Should we wait for the details page to load?
		return Q();
	}

	navigateBack(){
		logger.debug(`Navigating back`);
		this.hideFrame();
		this.showMaster();
		this.active = false;
	}

	hideMaster(){
		contentDiv().style.display = 'none';
	}

	showMaster(){
		contentDiv().style.display = 'block';
		document.activeElement.blur();
		window.focus();
	}

	createFrame(url){
		this.url = url;
		this.frame = document.createElement("iframe");

		Object.keys(FRAME_STYLE).forEach(k => {
			this.frame.style[k] = FRAME_STYLE[k]
		});
		document.body.appendChild(this.frame);
		this.frame.contentWindow.location = absoluteUrl(url);
	}


	showFrame(){
		this.frame.style.display = 'block';
		this.frame.contentWindow.focus();
	}

	hideFrame(){
		this.frame.style.display = 'none';
	}

	destroyFrame(){
		document.body.removeChild(this.frame);
		this.frame = null;
	}
}

function contentDiv(){
	return document.body.querySelector(`div[${PAGE_CONTENT_NODE_ID}]`);
}

function absoluteUrl(url){
	if (0 === url.indexOf('/')) {
		url = window.location.protocol + '//' + window.location.host + url;
	}
	return url;
}

module.exports = FramebackController;
