/**
 * Utils
 *
 * @method static Base64ToUint8Array(string: base64String)
 */
export default class Utils {
    /**
     * Transform Base64 encoded to Uint8Array
     *
     * @param  {String} base64String
     * @return Uint8Array
     *
     * @see https://github.com/Minishlink/physbook/blob/02a0d5d7ca0d5d2cc6d308a3a9b81244c63b3f14/app/Resources/public/js/app.js#L177
    */
    static Base64ToUint8Array(base64String) {
        try {
            const padding = '='.repeat((4 - base64String.length % 4) % 4)
            const base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/')
            const rawData = window.atob(base64)
            const outputArray = new Uint8Array(rawData.length)
            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i)
            }
            return outputArray
        } catch (error) {
            throw new Error("The given data is not a Base64 encoded string.");
        }
    }
}
