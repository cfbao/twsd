import { urlSafeBase64Encode, stringDigest } from "./util.js";

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

	const messageId = await stringDigest(encryptedData.key);

	/** @type {Response?} */
	let res = null;
	try {
		res = await fetch("/api/messages", {
			method: "POST",
			headers: { "content-type": "application/json" },
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

	const keyDisplay = /** @type {HTMLTextAreaElement} */ (
		document.getElementById("generatedUrl")
	);
	keyDisplay.value = `${window.location.protocol}//${window.location.host}/view#${encryptedData.key}`;
	keyDisplay.style.display = "block";
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
		ciphertext: urlSafeBase64Encode(new Uint8Array(encryptedData)),
		key: urlSafeBase64Encode(new Uint8Array(exportedKey)),
		iv: urlSafeBase64Encode(iv),
	};
}
