/**
 * EventSource
 * 
 * Wraps EventEmitter.
 * 
 */
var events = require('events');
var log4js = require('log4js');
var logger = log4js.getLogger("lib:EventSource");

module.exports = EventSource;

function EventObject(name,source,props) {
	if(name instanceof EventObject) {
		this._name = name._name;
		this._source = name._source;
		this._props = name._props;
	} else {
		this._name = name;
		this._source = source;
		this._props = props;
	}
	logger.trace("EventObject "+this._name);
}
EventObject.prototype.name = function() {
	return this._name;
};
EventObject.prototype.props = function() {
	return this._props;
}
EventObject.prototype.source = function() {
	return this._source;
}

function EventSource() {
};

EventSource.prototype = new events.EventEmitter();

/**
 * Post and event.  Invokes all 'hooks' on the event name.
 * If cb parameter represents a function, the function will be invoked
 * for each hook, with the parameters 'err' - any exception thrown by
 * the hook, and 'res' - the result of the invocation of the hook function. 
 * 
 * @param event - string or EventObject
 * @param cb - function(err,result) or 'undefined'.
 */

EventSource.prototype.post = function(event,cb) {
	var onPost = function(err,_cb) {
		logger.trace("onPost "+name);
		var r,e;
		try {
			r = _cb(err,new EventObject(event));
		} catch(_e) {
			e=_e;
		}
		if(typeof cb === 'function') {
			cb(e,r);
		}
	};
	if(typeof cb==='undefined') {
		cb = function(err,res) {
			if(err) {
				throw err;
			}
			if(typeof res === 'function') {
				process.nextTick(res);
			}
		};
	}
	var name = event instanceof EventObject ? event.name() : event;
	logger.debug("Post "+name);
	this.emit(name,event,onPost);
};

/**
 * Hook an event.
 * @param ev - The name of the event type.
 * @param cb - function(EventObject), returns result (any object).
 */
EventSource.prototype.hook = function(ev,cb) {
	var onHook = function(event,_cb) {
		if(typeof event === 'string') {
			event = this.event(event,{},this);
		}
		logger.trace("onHook "+event.name());
		var r,e;
		try {
			r = cb(event);
		} catch(_e) {
			logger.warn("onHook "+event.name()+" : "+_e);
			e = _e;
			r = undefined;
		}
		if(typeof r !=='undefined' || typeof e !== 'undefined') {
			_cb(e,r);
		}
	};
	logger.debug("hook "+ev);
	var _event = this;
	this.addListener(ev, onHook);
	return function() {
		_event.removeListener(onHook);
	};
};

EventSource.prototype.event = function(name,source,param) {
	return new EventObject(name,source,param);
}
