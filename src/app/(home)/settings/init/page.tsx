"use client";

import { useState } from "react";
 

export default function InitPage() {
  const [clientId, setClientId] = useState("");
  const [webApi, setWebApi] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

async function handleFetch() {
  if (!clientId.trim()) {
    setMessage("Please enter Client ID");
    return;
  }

  setLoading(true);
  setMessage("");
  setWebApi("");

  try {
    const result =
      await window.posApi.firebase.initialize(
        clientId.trim()
      );

    if (!result.success) {
      setMessage(
        result.error ||
        "Failed to fetch Web API"
      );
      return;
    }

    setWebApi(
      JSON.stringify(
        result.data,
        null,
        2
      )
    );

    // setMessage(
    //   "Web API fetched and saved successfully"
    // );
     setMessage(
      "Saved successfully..."
    );

  } catch (error) {
    console.error(
      "initialization error:",
      error
    );

    setMessage(
      "Something went wrong"
    );

  } finally {
    setLoading(false);
  }
}

  return (
    <div className="max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Initialize Client
      </h1>

      {/* Client ID */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">
          Client ID
        </label>

        <input
          type="text"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="foodapp_2345"
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {/* Fetch Button */}
      <button
        type="button"
        onClick={handleFetch}
        disabled={loading}
        className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Fetching..." : "Start Fetch"}
      </button>

      {/* Message */}
      {message && (
        <div className="mt-4 text-sm">
          {message}
        </div>
      )}

      {/* Web API */}
      {webApi && (
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">
            Configuration Done....
          </label>

          {/* <textarea
            value={webApi}
            readOnly
            rows={15}
            className="w-full rounded-md border bg-gray-50 p-3 font-mono text-sm"
          /> */}
        </div>
      )}
    </div>
  );
}