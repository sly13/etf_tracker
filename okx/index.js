// okx_test.mjs
import crypto from "crypto";
import axios from "axios"; // заменили node-fetch на axios

// Подставь свои значения или передавай через env
// const API_KEY = process.env.OKX_KEY || "2fe6d847-bb88-4749-9f3a-6d185376dd9a";
// const API_SECRET = process.env.OKX_SECRET || "015535765D0B766349A5E027231DA008";

const API_KEY = process.env.OKX_KEY || "cb165bc6-269c-4d73-b4ac-43860091cae0";
const API_SECRET = process.env.OKX_SECRET || "16AFF118061CAD204958F40B0E7D87E8";
const API_PASSPHRASE = process.env.OKX_PASSPHRASE || "ETFbot1m!";

// PROD или DEMO (если используешь sandbox — проверь доки OKX для URL)
const BASE_URL = process.env.OKX_BASE_URL || "https://www.okx.com";

function sign({ timestamp, method, requestPath, body = "" }) {
	const prehash = `${timestamp}${method.toUpperCase()}${requestPath}${body}`;
	const hmac = crypto.createHmac("sha256", API_SECRET);
	hmac.update(prehash);
	return { signature: hmac.digest("base64"), prehash };
}

async function getBalance(ccy = "") {
	const method = "GET";
	const q = ccy ? `?ccy=${encodeURIComponent(ccy)}` : "";
	const requestPath = `/api/v5/account/balance${q}`;
	const timestamp = new Date().toISOString(); // важно: ISO8601 timestamp, UTC
	const { signature, prehash } = sign({ timestamp, method, requestPath, body: "" });

	console.log("DEBUG timestamp:", timestamp);
	console.log("DEBUG prehash:", prehash);
	console.log("DEBUG signature:", signature);
	console.log("DEBUG API_KEY:", API_KEY);
	console.log("DEBUG API_SECRET:", API_SECRET);
	console.log("DEBUG API_PASSPHRASE:", API_PASSPHRASE);

	const headers = {
		"OK-ACCESS-KEY": API_KEY,
		"OK-ACCESS-SIGN": signature,
		"OK-ACCESS-TIMESTAMP": timestamp,
		"OK-ACCESS-PASSPHRASE": API_PASSPHRASE,
		"Content-Type": "application/json",
	};

	console.log("DEBUG headers:", JSON.stringify(headers, null, 2));

	const res = await axios({
		method,
		url: `${BASE_URL}${requestPath}`,
		headers,
	});

	if (res.status !== 200) {
		console.error(`HTTP ${res.status} ${res.statusText}`);
		console.error("Response body:", res.data);
		throw new Error(`Request failed: ${res.status}`);
	}

	return res.data;
}

(async () => {
	try {
		const result = await getBalance("USDT"); // подставь нужную валюту или пусто
		console.log("OK:", JSON.stringify(result, null, 2));
	} catch (err) {
		console.error("ERROR:", err.message);
		process.exit(1);
	}
})();