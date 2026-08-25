import { describe, expect, it } from "vitest";

function canAccessAdmin(role: "CUSTOMER" | "ADMIN" | "STAFF" | "DELIVERY") {
  return role === "ADMIN" || role === "STAFF" || role === "DELIVERY";
}

describe("admin authorization", () => {
  it("allows staff roles and rejects customers", () => {
    expect(canAccessAdmin("ADMIN")).toBe(true);
    expect(canAccessAdmin("STAFF")).toBe(true);
    expect(canAccessAdmin("DELIVERY")).toBe(true);
    expect(canAccessAdmin("CUSTOMER")).toBe(false);
  });
});
