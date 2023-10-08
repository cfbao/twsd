/**
 * @param {string} data
 */
export async function stringDigest(data) {
	return base64Encode(
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
export function base64Encode(uint8Array) {
	return btoa(String.fromCodePoint(...uint8Array));
}

/**
 * @param {string} base64String
 */
export function base64Decode(base64String) {
	return Uint8Array.from(atob(base64String), (c) => c.codePointAt(0));
}
