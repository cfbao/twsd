import { base64Decode, stringDigest } from "./common.js";

init();

async function init() {
	const hashLength = location.hash.length;
	if (hashLength !== 44 || !location.hash.startsWith("#")) {
		console.log("invalid hash");
		return;
	}

	const urlSafeKey = location.hash.substring(1, hashLength);

	const messageId = await stringDigest(urlSafeKey);

	// use messageId to get ciphertext & iv
	console.log(messageId);

	const plaintext = await decrypt({
		ciphertext: "",
		key: urlSafeKey.replaceAll("-", "+").replaceAll("_", "/"),
		iv: "",
	});

	/** @type HTMLTextAreaElement */
	const messageDisplay = document.getElementById("message");
	messageDisplay.value = plaintext;
}

/**
 * @param {{
 *  ciphertext: string,
 *  key: string,
 *  iv: string,
 * }} data
 */
async function decrypt(data) {
	const ciphertext = base64Decode(data.ciphertext);
	const key = base64Decode(data.key);
	const iv = base64Decode(data.iv);

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
