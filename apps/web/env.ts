// apps/web/env.ts
import { z } from "zod";

const WebEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().refine(
    (v) => {
      try {
        const u = new URL(v);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "NEXT_PUBLIC_API_BASE_URL must be an http(s) URL" },
  ),
});

export type WebEnv = z.infer<typeof WebEnvSchema>;

export function getWebEnv(): WebEnv {
  const parsed = WebEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Build a readable, non-deprecated error tree for logs/CI
    const tree = z.treeifyError(parsed.error);
    // Note: avoid logging secrets; here we only validate public vars
    console.error(JSON.stringify(tree, null, 2));
    throw new Error("Invalid web environment variables");
  }
  return parsed.data;
}
