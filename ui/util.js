/**
 * @param {string} data
 */
export async function stringDigest(data) {
	return urlSafeBase64Encode(
		new Uint8Array(
			await crypto.subtle.digest(
				{ name: "SHA-256" },
				new TextEncoder().encode(data),
			),
		),
	);
}

/**
 * @param {Uint8Array} uint8Array
 */
export function urlSafeBase64Encode(uint8Array) {
	let base64String = btoa(String.fromCodePoint(...uint8Array));
	const equalSignIndex = base64String.indexOf("=");
	if (equalSignIndex >= 0) {
		base64String = base64String.substring(0, equalSignIndex);
	}
	return base64String.replaceAll("+", "-").replaceAll("/", "_");
}

/**
 * @param {string} base64String
 */
export function urlSafeBase64Decode(base64String) {
	base64String = base64String.replaceAll("-", "+").replaceAll("_", "/");
	return Uint8Array.from(
		atob(base64String),
		(c) => /** @type {number} */ (c.codePointAt(0) ?? 0),
	);
}
