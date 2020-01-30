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
 * Check if the origin is localhost
 */
const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

/**
 * ServieWorkerManager
 *
 * @method register()
 * @method unregister()
 */
export default class ServieWorkerManager {
    /**
     *
     * @param {Object} options
     * @param {string} options.swUrl
     * @param {string} options.publicUrl
     * @param {Object} options.config
     * @param {string} options.config.scope
     * @param {function} options.config.onUpdate
     * @param {function} options.config.onSuccess
     */
    constructor(options) {
        if (!('serviceWorker' in navigator)) {
            this._throwUnsupportedException();
        }

        if (!options.swUrl) {
            this._throwInvalidServiceWorkerURL();
        }

        options.publicUrl = options.publicUrl || window.location.origin;
        options.config = options.config = {};
        options.config.scope = options.config.scope || "/";

        this.options = options;
    }

    /**
     * Register service worker
     */
    register() {
        // The URL constructor is available in all browsers that support SW.
        const publicUrl = new URL(this.options.publicUrl, window.location.href);

        if (publicUrl.origin !== window.location.origin) {
            // Our service worker won't work if PUBLIC_URL is on a different origin
            // from what our page is served on. This might happen if a CDN is used to
            // serve assets;
            return;
        }

        if (document.readyState === 'complete') {
            this._onReadyStateChange();
        } else {
            window.addEventListener(
                'load',
                this._onReadyStateChange.bind(this)
            );
        }
    }

    /**
     * Un-register service worker
     */
    async unregister() {
        const registration = await navigator.serviceWorker.ready;
        registration.unregister();
    }

    /**
     * On-ready-state-change even handler
     *
     * @private
     */
    async _onReadyStateChange() {
        const swUrl = this.options.swUrl;
        const config = this.options.config;

        if (isLocalhost) {
            // This is running on localhost. Let's check if a service worker still exists or not.
            this._checkValidServiceWorker(swUrl, config);

            // Add some additional logging to localhost, pointing developers to the
            // service worker/PWA documentation.
            await navigator.serviceWorker.ready;

            console.log(
                'This web app is being served cache-first by a service ' +
                'worker. To learn more, visit https://bit.ly/CRA-PWA'
            );
        } else {
            // Is not localhost. Just register service worker
            this._registerValidSW(swUrl, config);
        }
    }

    /**
     * Check if url is a valid Service Worker
     *
     * @private
     * @param {string} swUrl
     * @param {Object} config
     * @param {string} config.scope
     * @param {function} config.onUpdate
     * @param {function} config.onSuccess
     */
    async _checkValidServiceWorker(swUrl, config) {
        try {
            // Check if the service worker can be found. If it can't reload the page.
            const response = await fetch(swUrl)

            // Ensure service worker exists, and that we really are getting a JS file.
            const contentType = response.headers.get('content-type');

            if (
                response.status === 404 ||
                (contentType != null && contentType.indexOf('javascript') === -1)
            ) {
                // No service worker found. Probably a different app. Reload the page.
                const registration = navigator.serviceWorker.ready;
                await registration.unregister();

                window.location.reload();
            } else {
                // Service worker found. Proceed as normal.
                this._registerValidSW(swUrl, config);
            }
        } catch (error) {
            console.warn('No internet connection found. App is running in offline mode.');
        }
    }

    /**
     * Register a valid Service Worker
     *
     * @private
     * @param {string} swUrl
     * @param {Object} config
     * @param {string} config.scope
     * @param {function} config.onUpdate
     * @param {function} config.onSuccess
     */
    async _registerValidSW(swUrl, config) {
        const registration = await navigator.serviceWorker.register(
            swUrl, { scope: config.scope }
        );

        registration.onupdatefound = () => {
            const installingWorker = registration.installing;

            if (installingWorker == null) {
                return;
            }

            installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                        // At this point, the updated precached content has been fetched,
                        // but the previous service worker will still serve the older
                        // content until all client tabs are closed.
                        console.log(
                            'New content is available and will be used when all ' +
                            'tabs for this page are closed. See https://bit.ly/CRA-PWA.'
                        );

                        // Execute callback
                        if (config && config.onUpdate) {
                            config.onUpdate(registration);
                        }
                    } else {
                        // At this point, everything has been precached.
                        // It's the perfect time to display a
                        // "Content is cached for offline use." message.
                        console.log('Content is cached for offline use.');

                        // Execute callback
                        if (config && config.onSuccess) {
                            config.onSuccess(registration);
                        }
                    }
                }
            };
        };
    }

    /**
     * Throw invalid servie worker url
     *
     * @private
     */
    _throwInvalidServiceWorkerURL() {
        throw new Error("Service Worker URL is not available.");
    }

    /**
     * Throw unsupport servie worker exception
     *
     * @private
     */
    _throwUnsupportedException() {
        throw new Error("Service Worker isn't supported.");
    }
}

const serviceManagerManager = new ServieWorkerManager({
    swUrl: "/sw.js",
    publicUrl: "",
    config: {
        onSuccess: () => { },
        onUpdate: () => { }
    }
})
