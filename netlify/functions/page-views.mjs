function json(statusCode, body) {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function getCount(payload) {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  if (typeof payload.value === "number") {
    return payload.value;
  }

  if (typeof payload.count === "number") {
    return payload.count;
  }

  if (typeof payload.up_count === "number") {
    return payload.up_count;
  }

  if (typeof payload.data === "number") {
    return payload.data;
  }

  if (payload.data && typeof payload.data.value === "number") {
    return payload.data.value;
  }

  if (payload.data && typeof payload.data.count === "number") {
    return payload.data.count;
  }

  if (payload.data && typeof payload.data.up_count === "number") {
    return payload.data.up_count;
  }

  return null;
}

export default async function handler(event) {
  const workspace = (process.env.COUNTERAPI_WORKSPACE ?? "").trim();
  const counterName = (process.env.COUNTERAPI_NAME ?? "world-cup-2026-profile").trim();
  const accessToken = (process.env.COUNTERAPI_TOKEN ?? "").trim();

  if (!workspace || !counterName || !accessToken) {
    return json(500, {
      error: "Counter server variables are missing.",
    });
  }

  const mode = event.queryStringParameters?.mode === "get" ? "get" : "up";
  const endpoint =
    mode === "up"
      ? `https://api.counterapi.dev/v2/${workspace}/${counterName}/up`
      : `https://api.counterapi.dev/v2/${workspace}/${counterName}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = await response.json().catch(() => null);
    const count = getCount(payload);

    if (!response.ok || count === null) {
      return json(response.status, {
        error: "CounterAPI request failed.",
        details: payload,
      });
    }

    return json(200, { count });
  } catch {
    return json(500, {
      error: "CounterAPI request failed.",
    });
  }
}
