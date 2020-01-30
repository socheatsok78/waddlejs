/**
 * WATCHER_KEY Symbol
 */
const PRIVATE_FIELD =
    typeof Symbol === 'undefined'
        ? `__listener${Date.now()}`
        : Symbol('private');

/**
 * WATCHER_KEY Symbol
 */
const WATCHER_KEY =
    typeof Symbol === 'undefined'
        ? `__w_listener${Date.now()}`
        : Symbol('watcher');

/**
 * Listener
 *
 * @method function emit(string: event, any: payload)
 * @method function on(string: event, function: callback)
 * @method function off(string: event, function: callback)
 */
export default class Listener {
    /**
     * Create a new Listener instance
     *
     * @param {Object} listener
     */
    constructor(listener = null) {
        this[PRIVATE_FIELD] = {
            listener: listener || {}
        }
    }

    /**
     * Emit the event
     *
     * @param {string} event
     * @param {any} payload
     */
    emit(event, payload = null) {
        const data = { event, data: payload };

        this[PRIVATE_FIELD].listener[event].forEach(callback => callback(data));
    }

    /**
     * Check if event has event handlers
     *
     * @param {string} event
     * @returns Boolean
     */
    has(event) {
        return (event in this[PRIVATE_FIELD].listener && this[PRIVATE_FIELD].listener[event].length);
    }

    /**
     * Register an event listener
     *
     * @param {string} event
     * @param {function} callback
     * @returns function
     */
    on(event, callback) {
        this[PRIVATE_FIELD].listener[event] = this[PRIVATE_FIELD].listener[event] || [];
        this[PRIVATE_FIELD].listener[event].push(callback);

        return () => this.off(event, callback);
    }

    /**
     * Remove a event listener
     *
     * @param {string} event
     * @param {function} callback
     */
    off(event, callback) {
        if (!(event in this[PRIVATE_FIELD].listener)) {
            return
        }

        const listeners = this[PRIVATE_FIELD].listener[event].filter(value => {
            return (value !== callback);
        })

        this[PRIVATE_FIELD].listener[event] = listeners;
    }

    /**
     * Define additional properties to the given object
     *
     * @param {Object} target
     * @returns self
     */
    with(target) {
        Object.defineProperty(target, 'emit', {
            value: (event, payload = null) => this.emit(event, payload),
            writable: false
        });

        Object.defineProperty(target, 'on', {
            value: (event, callback) => this.on(event, callback),
            writable: false
        });

        Object.defineProperty(target, 'off', {
            value: (event, callback) => this.off(event, callback),
            writable: false
        });

        return this;
    }
}
