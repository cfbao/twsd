import { urlSafeBase64Encode, stringDigest } from "./util.js";

const inputDiv = /** @type {HTMLDivElement} */ (
	document.getElementById("input")
);
const messageElement = /** @type {HTMLTextAreaElement} */ (
	document.getElementById("message")
);
const submitButton = /** @type {HTMLButtonElement} */ (
	document.getElementById("submit")
);
const loader = /** @type {HTMLDivElement} */ (
	document.getElementById("loader-container")
);
const resultDiv = /** @type {HTMLDivElement} */ (
	document.getElementById("result")
);
const generatedUrlElem = /** @type {HTMLDivElement} */ (
	document.getElementById("generated-url")
);
const snackbar = /** @type {HTMLDivElement} */ (
	document.getElementById("snackbar")
);

submitButton.addEventListener("click", sendMessage);

/** @type {HTMLButtonElement} */ (
	document.getElementById("copy-url")
).addEventListener("click", () => {
	navigator.clipboard.writeText(generatedUrlElem.innerText);
	showSnackBar("success", "Link copied to clipboard");
});

/** @type {HTMLButtonElement} */ (
	document.getElementById("send-another")
).addEventListener("click", reset);

async function sendMessage() {
	if (messageElement.value.length === 0) {
		showSnackBar("error", "Please enter a message");
		return;
	}
	submitButton.classList.add("invisible");
	loader.classList.add("show");

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
		showSnackBar(
			"error",
			"Failed to send the message. Please try again later.",
		);
		reset();
		return;
	}

	inputDiv.classList.add("hide");
	messageElement.value = "";
	loader.classList.remove("show");

	generatedUrlElem.innerText = `${window.location.protocol}//${window.location.host}/view#${encryptedData.key}`;
	resultDiv.classList.remove("hide");
}

function reset() {
	loader.classList.remove("show");
	submitButton.classList.remove("invisible");
	resultDiv.classList.add("hide");

	inputDiv.classList.remove("hide");
	messageElement.focus();

	generatedUrlElem.innerText = "";
}

/**
 * @param {"success" | "error"} level
 * @param {string} text
 */
function showSnackBar(level, text) {
	snackbar.innerText = text;
	snackbar.classList.remove("success", "error");
	snackbar.classList.add(level);
	snackbar.classList.add("show");
	snackbar.classList.remove("hide");
	setTimeout(() => {
		snackbar.classList.add("hide");
		snackbar.classList.remove("show");
		snackbar.classList.remove(level);
		snackbar.innerText = "";
	}, 3000);
}

/**
 * @param {string} plaintext
 */
async function encrypt(plaintext) {
	const key = await crypto.subtle.generateKey(
		{ name: "AES-GCM", length: 256 },
		true,
		["encrypt"],
	);
	const iv = crypto.getRandomValues(new Uint8Array(32));
	const data = new TextEncoder().encode(plaintext);

	// add random padding to obscure data length
	let paddingLength = 0;
	// ensure the padded data is at least 128 bytes to protect data length that's very small
	while (paddingLength + data.length < 128) {
		paddingLength = crypto.getRandomValues(new Uint8Array(1))[0];
	}
	const padding = crypto.getRandomValues(new Uint8Array(paddingLength));
	const paddedData = new Uint8Array(1 + padding.length + data.length);
	paddedData[0] = paddingLength;
	paddedData.set(padding, 1);
	paddedData.set(data, 1 + paddingLength);

	const encryptedData = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		paddedData,
	);

	const exportedKey = await crypto.subtle.exportKey("raw", key);

	return {
		ciphertext: urlSafeBase64Encode(new Uint8Array(encryptedData)),
		key: urlSafeBase64Encode(new Uint8Array(exportedKey)),
		iv: urlSafeBase64Encode(iv),
	};
}
