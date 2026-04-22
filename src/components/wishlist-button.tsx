"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/src/lib/auth-client";

type WishlistButtonProps = {
  productName: string;
  className?: string;
  showLabel?: boolean;
};

export default function WishlistButton({
  productName,
  className = "",
  showLabel = false,
}: WishlistButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      if (!session?.user) {
        setWishlisted(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/wishlist?name=${encodeURIComponent(productName)}`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { wishlisted?: boolean };
        setWishlisted(Boolean(payload.wishlisted));
      } catch {
        setWishlisted(false);
      }
    };

    void loadStatus();
  }, [productName, session?.user]);

  const toggleWishlist = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: productName }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { wishlisted?: boolean };
      setWishlisted(Boolean(payload.wishlisted));
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggleWishlist();
      }}
      disabled={loading}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 font-medium transition " +
        (wishlisted
          ? "border-red-600 text-red-600 bg-red-50"
          : "border-black/20 text-black bg-white") +
        (loading ? " opacity-70" : "") +
        (className ? ` ${className}` : "")
      }
    >
      <svg viewBox="0 0 50 50" className="w-5 h-5" fill="none">
        <path
          d="M25 39.7l-.6-.5C11.5 28.7 8 25 8 19c0-5 4-9 9-9 4.1 0 6.4 2.3 8 4.1 1.6-1.8 3.9-4.1 8-4.1 5 0 9 4 9 9 0 6-3.5 9.7-16.4 20.2l-.6.5zM17 12c-3.9 0-7 3.1-7 7 0 5.1 3.2 8.5 15 18.1 11.8-9.6 15-13 15-18.1 0-3.9-3.1-7-7-7-3.5 0-5.4 2.1-6.9 3.8L25 17.1l-1.1-1.3C22.4 14.1 20.5 12 17 12z"
          stroke="currentColor"
          fill={wishlisted ? "currentColor" : "none"}
        />
      </svg>
      {showLabel ? (wishlisted ? "Wishlisted" : "Add to Wishlist") : null}
    </button>
  );
}
