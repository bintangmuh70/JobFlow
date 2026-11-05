import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { SITE_CONFIG, getAbsoluteUrl, getSiteJsonLd } from "@/lib/constants";

describe("Technical SEO & Asset Configuration", () => {
  it("has valid centralized site constants", () => {
    expect(SITE_CONFIG.name).toBe("JobFlow");
    expect(SITE_CONFIG.domain).toMatch(/^https:\/\//);
    expect(SITE_CONFIG.contact.whatsappClean).toBeTruthy();
    expect(SITE_CONFIG.contact.email).toBe("halo@jobflow.id");
    expect(SITE_CONFIG.seo.ogImage).toBe("/og-image.webp");
  });

  it("produces correct absolute canonical and OG image URLs", () => {
    const rootUrl = getAbsoluteUrl("/");
    const ogUrl = getAbsoluteUrl(SITE_CONFIG.seo.ogImage);
    expect(rootUrl).toBe(`${SITE_CONFIG.domain}/`);
    expect(ogUrl).toBe(`${SITE_CONFIG.domain}/og-image.webp`);
  });

  it("contains valid sitemap.xml in public folder", () => {
    const sitemapPath = path.resolve(process.cwd(), "public/sitemap.xml");
    expect(fs.existsSync(sitemapPath)).toBe(true);
    const content = fs.readFileSync(sitemapPath, "utf-8");
    expect(content).toContain("<loc>https://jobflow.id/</loc>");
    expect(content).toContain("<urlset");
  });

  it("contains valid robots.txt with sitemap directive in public folder", () => {
    const robotsPath = path.resolve(process.cwd(), "public/robots.txt");
    expect(fs.existsSync(robotsPath)).toBe(true);
    const content = fs.readFileSync(robotsPath, "utf-8");
    expect(content).toContain("Sitemap: https://jobflow.id/sitemap.xml");
  });

  it("contains optimized WebP assets in public folder", () => {
    const ogImagePath = path.resolve(process.cwd(), "public/og-image.webp");
    const faviconWebpPath = path.resolve(process.cwd(), "public/favicon.webp");
    expect(fs.existsSync(ogImagePath)).toBe(true);
    expect(fs.existsSync(faviconWebpPath)).toBe(true);

    const ogStats = fs.statSync(ogImagePath);
    // Ensure OG image is lightweight and under 100KB for rapid social cards load
    expect(ogStats.size).toBeGreaterThan(1000);
    expect(ogStats.size).toBeLessThan(100000);
  });

  it("generates valid Schema.org JSON-LD structured data", () => {
    const jsonLd = getSiteJsonLd();
    expect(Array.isArray(jsonLd)).toBe(true);
    expect(jsonLd.some((item) => item["@type"] === "WebApplication")).toBe(
      true,
    );
    expect(jsonLd.some((item) => item["@type"] === "Organization")).toBe(true);
  });
});
