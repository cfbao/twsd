// @ts-check

/**
 * @param {{ request: { uri: string; }; }} event
 */
function handler(event) {
	var request = event.request;
	var uri = request.uri;

	if (!uri || uri === "/") {
		request.uri = "/index.html";
	} else if (!uri.startsWith("/api/") && !uri.includes(".")) {
		request.uri = uri + ".html";
	}
	return request;
}
