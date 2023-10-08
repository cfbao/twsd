import { base64Encode, stringDigest } from "./util.js";

const submitButton = /** @type {HTMLButtonElement} */ (
	document.getElementById("submit")
);
submitButton.addEventListener("click", generateLink);

async function generateLink() {
	const messageElement = /** @type {HTMLTextAreaElement} */ (
		document.getElementById("message")
	);
	if (messageElement.value.length === 0) {
		return;
	}
	const encryptedData = await encrypt(messageElement.value);

	const urlSafeKey = encryptedData.key
		// base64 encoded 256-bit data always ends with a single "="
		.substring(0, encryptedData.key.length - 1)
		.replaceAll("+", "-")
		.replaceAll("/", "_");

	const messageId = await stringDigest(urlSafeKey);

	/** @type {Response?} */
	let res = null;
	try {
		res = await fetch("/api/messages", {
			method: "POST",
			body: JSON.stringify({
				id: messageId,
				ciphertext: encryptedData.ciphertext,
				iv: encryptedData.iv,
			}),
		});
	} catch {}
	if (!res?.ok) {
		return;
	}

	const keyDisplay = /** @type {HTMLDivElement} */ (
		document.getElementById("generatedUrl")
	);
	keyDisplay.innerText = `${window.location.protocol}//${window.location.host}/view#${urlSafeKey}`;
}

/**
 * @param {string} plaintext
 */
export async function encrypt(plaintext) {
	const key = await crypto.subtle.generateKey(
		{ name: "AES-GCM", length: 256 },
		true,
		["encrypt"],
	);
	const iv = crypto.getRandomValues(new Uint8Array(32));
	const data = new TextEncoder().encode(plaintext);
	const encryptedData = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		data,
	);

	const exportedKey = await crypto.subtle.exportKey("raw", key);

	return {
		ciphertext: base64Encode(new Uint8Array(encryptedData)),
		key: base64Encode(new Uint8Array(exportedKey)),
		iv: base64Encode(iv),
	};
}
