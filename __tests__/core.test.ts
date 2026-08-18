import { describe, expect, it } from "vitest";
import { addKurus, formatTL, formatTLFromKurus, fromKurus, multiplyKurus, toKurus } from "@/lib/money";
import { canTransition, trackingIndex } from "@/lib/order-status";
import { reservationSchema } from "@/lib/validations";
import { parseTableParam } from "@/lib/utils";
import { cartItemKey, getCartTotals, type CartItem } from "@/store/cart";
import { verifySessionToken } from "@/lib/session";

describe("money", () => {
  it("converts decimal amounts to kuruş without float drift", () => {
    expect(toKurus("650")).toBe(65000);
    expect(toKurus("1300")).toBe(130000);
    expect(toKurus(10.1)).toBe(1010);
    expect(fromKurus(65000)).toBe(650);
    expect(multiplyKurus(65000, 2)).toBe(130000);
    expect(addKurus(65000, 11000, 4000)).toBe(80000);
  });

  it("formats Turkish lira", () => {
    expect(formatTL(650)).toContain("650");
    expect(formatTLFromKurus(130000)).toContain("1.300");
  });
});

describe("cart totals", () => {
  it("adds product quantities and prices", () => {
    const items: CartItem[] = [
      {
        key: "a",
        productId: "1",
        slug: "a",
        name: "Antrikot",
        image: "/a.jpg",
        unitKurus: 65000,
        quantity: 1,
      },
      {
        key: "b",
        productId: "2",
        slug: "b",
        name: "Salata",
        image: "/b.jpg",
        unitKurus: 11000,
        quantity: 2,
      },
    ];
    expect(getCartTotals(items)).toEqual({ quantity: 3, subtotalKurus: 87000, totalKurus: 87000 });
    expect(cartItemKey({ productId: "1", doneness: "medium" })).toBe("1::medium::");
  });
});

describe("QR table resolution", () => {
  it("parses valid table numbers", () => {
    expect(parseTableParam("12")).toBe(12);
    expect(parseTableParam("1")).toBe(1);
  });

  it("rejects invalid QR table params", () => {
    expect(parseTableParam("abc")).toBeNull();
    expect(parseTableParam("0")).toBeNull();
    expect(parseTableParam("1000")).toBeNull();
  });
});

describe("order status", () => {
  it("allows valid status changes", () => {
    expect(canTransition("PENDING", "PREPARING")).toBe(true);
    expect(canTransition("PREPARING", "READY")).toBe(true);
    expect(canTransition("COMPLETED", "PENDING")).toBe(false);
    expect(trackingIndex("PREPARING")).toBe(1);
  });
});

describe("reservation validation", () => {
  it("accepts a complete reservation", () => {
    const parsed = reservationSchema.safeParse({
      name: "Ahmet Yılmaz",
      phone: "05551112233",
      email: "ahmet@example.com",
      date: "2026-08-20",
      time: "20:00",
      guests: 4,
      note: "Pencere kenarı",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects incomplete reservation", () => {
    const parsed = reservationSchema.safeParse({
      name: "A",
      phone: "12",
      email: "not-an-email",
      date: "",
      time: "",
      guests: 0,
    });
    expect(parsed.success).toBe(false);
  });
});

describe("admin authorization", () => {
  it("rejects an invalid session token", async () => {
    process.env.AUTH_SECRET = "test-secret-must-be-long-enough";
    expect(await verifySessionToken("not-a-token")).toBeNull();
  });
});
