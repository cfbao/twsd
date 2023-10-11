import { urlSafeBase64Decode, stringDigest } from "./util.js";

init();

async function init() {
	const hashLength = location.hash.length;
	if (hashLength !== 44 || !location.hash.startsWith("#")) {
		console.log("invalid hash");
		return;
	}

	const key = location.hash.substring(1, hashLength);
	const messageId = await stringDigest(key);

	/** @type {Response?} */
	let res = null;
	try {
		res = await fetch(`/api/messages/${messageId}`, { method: "DELETE" });
	} catch {}
	if (!res?.ok) {
		return;
	}

	/** @type {{id: string; iv: string; ciphertext: string;}} */
	const encryptedMessage = await res.json();

	const plaintext = await decrypt({
		ciphertext: encryptedMessage.ciphertext,
		key: key,
		iv: encryptedMessage.iv,
	});

	const messageDisplay = /** @type {HTMLParagraphElement} */ (
		document.getElementById("message")
	);
	messageDisplay.innerText = plaintext;
	messageDisplay.classList.replace("h", "f");
}

/**
 * @param {{
 *  ciphertext: string,
 *  key: string,
 *  iv: string,
 * }} data
 */
async function decrypt(data) {
	const ciphertext = urlSafeBase64Decode(data.ciphertext);
	const key = urlSafeBase64Decode(data.key);
	const iv = urlSafeBase64Decode(data.iv);

	const decryptKey = await crypto.subtle.importKey(
		"raw",
		key,
		{ name: "AES-GCM" },
		false,
		["decrypt"],
	);

	const decryptedData = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv },
		decryptKey,
		ciphertext,
	);

	return new TextDecoder().decode(decryptedData);
}
