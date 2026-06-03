import { test, expect } from "@playwright/test";

test("google status endpoint responds", async ({ request }) => {
  const res = await request.get("/api/integrations/google/status");
  expect([200, 503]).toContain(res.status());
});

test("google authorize returns 302 or 503", async ({ request }) => {
  const res = await request.get(
    "/api/integrations/google/authorize?teacherId=00000000-0000-0000-0000-000000000001",
    { maxRedirects: 0 }
  );
  expect([302, 401, 503]).toContain(res.status());
});
