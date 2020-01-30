import Listener from './utils/Listener';

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

/**
 * MessageBus
 *
 * @method void send(string: event, any: payload)
 * @method function on(string: event, function: callback)
 * @method function off(string: event, function: callback)
 * @method void close()
 */
export default class MessageBus {
    /**
     * Create a new MessageBus instance
     *
     * @param {string} id Channel unique id
     */
    constructor(id = 'default-channel') {
        this.id = id;

        this._init();
        this._registerEventListener()
    }

    /**
     * Broadcast a new message
     * @param {string} event
     * @param {any} payload
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
     * Initialze private fields
     */
    _init() {
        this[PRIVATE_FIELD] = {
            bus: new BroadcastChannel(this.id),
            status: {
                closed: false
            },
            listener: new Listener().with(this)
        };
    }

    /**
     * Register event listeners
     */
    _registerEventListener() {
        this[PRIVATE_FIELD].bus.addEventListener('message', (messageEvent) => {
            const { event, payload } = messageEvent.data;

            if (!(this[PRIVATE_FIELD].listener.has(event))) {
                return
            }

            this[PRIVATE_FIELD].listener.emit(event, messageEvent);
        });
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
