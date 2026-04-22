"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";

import { useSession } from "@/src/lib/auth-client";

type PayPalCheckoutOverlayProps = {
  productName: string;
  amountInr: number;
  clientId: string;
};

export default function PayPalCheckoutOverlay({
  productName,
  amountInr,
  clientId,
}: PayPalCheckoutOverlayProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  //const [clientToken, setClientToken] = useState<string | null>(null);
  //const [loadingClientToken, setLoadingClientToken] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const amountUsd = useMemo(() => (amountInr / 83).toFixed(2), [amountInr]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toast]);
  /*
  useEffect(() => {
    if (!open || clientToken || loadingClientToken) {
      return;
    }

    const fetchClientToken = async () => {
      setLoadingClientToken(true);
      try {
        const response = await fetch("/api/payments/client-token", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          router.push("/login");
          throw new Error("Login required");
        }

        const payload = (await response.json()) as {
          clientToken?: string;
          message?: string;
        };

        if (!response.ok || !payload.clientToken) {
          throw new Error(payload.message || "Failed to initialize checkout");
        }
        console.log("Received PayPal client token:", payload.clientToken);
        setClientToken(payload.clientToken);
      } catch (error) {
        const text =
          error instanceof Error
            ? error.message
            : "Failed to initialize checkout";
        setToast({ type: "error", text });
        setOpen(false);
      } finally {
        setLoadingClientToken(false);
      }
    };

    void fetchClientToken();
  }, [open, clientToken, loadingClientToken, router]);
*/
  const openCheckout = () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setToast(null);
    setOpen(true);
  };

  if (!clientId) {
    return (
      <button
        className="px-6 py-3 rounded-xl bg-black/70 text-white font-medium"
        type="button"
        disabled
      >
        Buy Now (PayPal not configured)
      </button>
    );
  }

  return (
    <>
      <button
        className="px-6 py-3 rounded-xl bg-black text-white font-medium"
        type="button"
        onClick={openCheckout}
      >
        Buy Now
      </button>

      {open ? (
        <div className="fixed inset-0 z-100 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Checkout with PayPal</h3>
                <p className="text-sm text-black/60">{productName}</p>
                <p className="text-sm text-black/60">
                  Amount: ${amountUsd} USD
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-black/20 px-3 py-1"
              >
                Close
              </button>
            </div>

            <PayPalProvider
              environment="sandbox"
              clientId={clientId}
              // clientToken={clientToken as string}
              components={["paypal-payments"]}
              pageType="checkout"
            >
              <PayPalOneTimePaymentButton
                presentationMode="auto"
                createOrder={async () => {
                  try {
                    const response = await fetch("/api/payments/create-order", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      credentials: "include",
                      body: JSON.stringify({
                        amount: amountUsd,
                        currency: "USD",
                        productName,
                      }),
                    });

                    if (response.status === 401) {
                      router.push("/login");
                      throw new Error("Login required");
                    }

                    const payload = (await response.json()) as {
                      orderId?: string;
                      message?: string;
                    };

                    if (!response.ok || !payload.orderId) {
                      throw new Error(
                        payload.message || "Failed to create order",
                      );
                    }

                    return { orderId: payload.orderId };
                  } catch (error) {
                    const text =
                      error instanceof Error
                        ? error.message
                        : "Failed to start checkout";
                    setToast({ type: "error", text });
                    throw error;
                  }
                }}
                onApprove={async ({ orderId }: { orderId: string }) => {
                  try {
                    const response = await fetch(
                      `/api/payments/capture-order/${encodeURIComponent(orderId)}`,
                      {
                        method: "POST",
                        credentials: "include",
                      },
                    );

                    const payload = (await response.json()) as {
                      success?: boolean;
                      message?: string;
                    };

                    if (!response.ok || !payload.success) {
                      throw new Error(
                        payload.message || "Failed to capture payment",
                      );
                    }

                    setToast({
                      type: "success",
                      text: "Payment captured successfully.",
                    });
                    setOpen(false);
                    router.push("/orders");
                    router.refresh();
                  } catch (error) {
                    const text =
                      error instanceof Error
                        ? error.message
                        : "Failed to capture payment";
                    setToast({ type: "error", text });
                    throw error;
                  }
                }}
                onCancel={() => {
                  setToast({
                    type: "error",
                    text: "Checkout was cancelled.",
                  });
                }}
                onError={(error) => {
                  const text =
                    error instanceof Error
                      ? error.message
                      : "PayPal checkout failed";
                  setToast({ type: "error", text });
                }}
              />
            </PayPalProvider>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed right-4 top-20 z-110 max-w-sm">
          <div
            className={
              "rounded-lg border px-4 py-3 text-sm shadow-lg bg-white " +
              (toast.type === "success"
                ? "border-green-300 text-green-800"
                : "border-red-300 text-red-800")
            }
          >
            <div className="flex items-start gap-3">
              <p className="flex-1 leading-5">{toast.text}</p>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="rounded border border-black/10 px-2 py-0.5 text-xs"
                aria-label="Dismiss notification"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
