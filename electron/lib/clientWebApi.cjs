const WEB_API_BASE_URL = "https://food.it10x.com/api/client/webapi";

async function fetchClientWebApi(clientId) {
  console.log("========== FETCH CLIENT WEB API ==========");

  if (!clientId || !clientId.trim()) {
    throw new Error("Client ID is required");
  }

  const cleanClientId = clientId.trim();

  const url =
    `${WEB_API_BASE_URL}/${encodeURIComponent(cleanClientId)}`;

  console.log("FETCHING CLIENT:", url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Client API request failed: ${response.status}`
    );
  }

  const result = await response.json();

  console.log("CLIENT API RESPONSE:", result);

  if (!result.success) {
    throw new Error(
      result.error || "Failed to fetch client"
    );
  }

  if (!result.data) {
    throw new Error("Client data is empty");
  }

  // Extract only webApi
  if (!result.data.webApi) {
    throw new Error(
      "Web API configuration not found for this client"
    );
  }

  return result.data.webApi;
}

module.exports = {
  fetchClientWebApi,
};