// The BroadcastChannel interface represents a named channel that any browsing context
// of a given origin can subscribe to.

// It allows communication between different documents(in different windows, tabs, frames or iframes)
// of the same origin.Messages are broadcasted via a message event fired at all BroadcastChannel objects
// listening to the channel.

/**
 * WATCHER_KEY Symbol
 */
const PRIVATE_FIELD =
    typeof Symbol === 'undefined'
        ? `__message_bus${Date.now()}`
        : Symbol('private');

/**
 * WATCHER_KEY Symbol
 */
const WATCHER_KEY =
    typeof Symbol === 'undefined'
        ? `__w_message_bus${Date.now()}`
        : Symbol('watcher');

export default class MessageBus {
    constructor(id = 'default-channel') {
        this.id = id;

        this._init();
        this._registerEventListener()
    }

    /**
     * Broadcast a new message
     * @param event
     * @param payload
     */
    send(event, payload) {
        this._checkChannelAvailability();

        this[PRIVATE_FIELD].bus.postMessage({
            event: event,
            payload: payload
        });
    }

    /**
     * Terminates the connection to the underlying channel
     */
    close() {
        if (!this[PRIVATE_FIELD].status.closed) {
            this[PRIVATE_FIELD].bus.close();
            this[PRIVATE_FIELD].status.closed = true;
        }
    }

    /**
     * Listen on the broadcasted channel
     *
     * @param event
     * @param callback
     */
    listen(event, callback) {
        this[PRIVATE_FIELD].listener[event] = this[PRIVATE_FIELD].listener[event] || [];
        this[PRIVATE_FIELD].listener[event].push(callback);

        return () => this.unlisten(event, callback);
    }

    /**
     * Remove listener from the broadcast channel
     * @param event
     * @param callback
     */
    unlisten(event, callback) {
        this._removeListener(event, callback);
    }

    /**
     * Initialze private fields
     */
    _init() {
        this[PRIVATE_FIELD] = {
            bus: new BroadcastChannel(this.id),
            status: {
                closed: false
            },
            listener: {}
        };
    }

    /**
     * Register event listeners
     */
    _registerEventListener() {
        this[PRIVATE_FIELD].bus.addEventListener('message', (messageEvent) => {
            const { event, payload } = messageEvent.data;

            if (!(event in this[PRIVATE_FIELD].listener)) {
                return
            }

            this[PRIVATE_FIELD].listener[event].forEach(callback => callback(payload));
        });
    }

    /**
     * Remove a event listener
     * @param event
     * @param callback
     */
    _removeListener(event, callback) {
        if (!(event in this[PRIVATE_FIELD].listener)) {
            return
        }

        const listeners = this[PRIVATE_FIELD].listener[event].filter(value => {
            return (value !== callback);
        })

        this[PRIVATE_FIELD].listener[event] = listeners;
    }

    /**
     * Check if message bus is opened
     */
    _checkChannelAvailability() {
        if (this[PRIVATE_FIELD].status.closed) {
            this._throwChannelClosedException()
        }
    }

    /**
     * Throw channel closed exception
     */
    _throwChannelClosedException() {
        throw new Error('Unable to send broadcast. The channel has been closed.');
    }
}
