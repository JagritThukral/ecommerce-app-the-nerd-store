const base = "https://api-m.sandbox.paypal.com";
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

export type PayPalCaptureOrderResponse = {
  status?: string;
  purchase_units?: Array<{
    custom_id?: string;
    amount?: {
      value?: string;
      currency_code?: string;
    };
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
        amount?: {
          value?: string;
          currency_code?: string;
        };
      }>;
    };
  }>;
};

function ensurePaypalEnv() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");
  }
}

export async function generateAccessToken() {
  ensurePaypalEnv();

  const auth = Buffer.from(
    PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET,
  ).toString("base64");

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const jsonData = await handleResponse(response);

  if (
    typeof jsonData !== "object" ||
    jsonData === null ||
    !("access_token" in jsonData) ||
    typeof (jsonData as { access_token: unknown }).access_token !== "string"
  ) {
    throw new Error("Invalid PayPal access token response");
  }

  return jsonData.access_token;
}

export async function generateClientToken(): Promise<string> {
  const accessToken = await generateAccessToken();
  const response = await fetch(`${base}/v1/identity/generate-token`, {
    method: "post",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Accept-Language": "en_US",
      "Content-Type": "application/json",
    },
  });
  const jsonData = await handleResponse(response);

  if (
    typeof jsonData !== "object" ||
    jsonData === null ||
    !("client_token" in jsonData) ||
    typeof (jsonData as { client_token: unknown }).client_token !== "string"
  ) {
    throw new Error("Invalid PayPal client token response");
  }

  return (jsonData as { client_token: string }).client_token;
}
export async function handleResponse(response: Response): Promise<unknown> {
  const json: unknown = await response.json().catch(() => null);

  if (response.status === 200 || response.status === 201) {
    try {
      const preview = JSON.stringify(json).slice(0, 500);
      console.log("PayPal success response (truncated):", preview);
    } catch {
      // ignore logging issues
    }

    return json;
  }

  const maybeMessage =
    typeof json === "object" &&
    json !== null &&
    "message" in json &&
    typeof (json as { message: unknown }).message === "string"
      ? (json as { message: string }).message
      : null;

  const message =
    maybeMessage || `PayPal request failed with status ${response.status}`;

  throw new Error(message);
}

async function paypalRequest(path: string, options: RequestInit = {}) {
  const accessToken = await generateAccessToken();

  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });

  return handleResponse(response);
}

type CreateOrderInput = {
  amount: string;
  currency: string;
  productName: string;
};

export async function createPaypalOrder(input: CreateOrderInput) {
  const response = await paypalRequest("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: input.productName,
          amount: {
            currency_code: input.currency,
            value: input.amount,
          },
        },
      ],
    }),
  });

  if (
    typeof response !== "object" ||
    response === null ||
    !("id" in response) ||
    typeof (response as { id: unknown }).id !== "string"
  ) {
    throw new Error("Invalid PayPal create order response");
  }

  return response as { id: string; status?: string };
}

export async function capturePaypalOrder(
  orderId: string,
): Promise<PayPalCaptureOrderResponse> {
  const response = await paypalRequest(
    `/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
    },
  );

  if (typeof response !== "object" || response === null) {
    throw new Error("Invalid PayPal capture response");
  }

  return response as PayPalCaptureOrderResponse;
}
