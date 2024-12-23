import { checkForDuplicateLinks } from "../utils/check-for-duplicated-links";
import { extractUrlsFromHtml } from "../utils/extract-urls-from-html";

const LINK_1 = "https://link1.com";
const LINK_2 = "https://link2.com";
const LINK_3 = "https://link3.com";

const HTML_LINK_1 = `<div><a href="${LINK_1}"><code>abcdef1</code></a></div>`;
const HTML_LINK_2 = `<div><a href="${LINK_2}"><code>abcdef2</code></a></div>`;
const HTML_LINK_3 = `<div><a href="${LINK_1}"><code>abcdef3</code></a></div>`;

describe("checkForDuplicateLinks", () => {
  it("should return true if the deployment link already exists", () => {
    const existingLinks = [HTML_LINK_1, HTML_LINK_2, HTML_LINK_3];
    const deploymentLink = LINK_1;

    const existingUrls = existingLinks.map((link) => extractUrlsFromHtml(link)).flat();

    expect(checkForDuplicateLinks(existingUrls, deploymentLink)).toBe(true);
  });

  it("should return false if the deployment link does not exist", () => {
    const existingLinks = [HTML_LINK_1, HTML_LINK_2];
    const deploymentLink = LINK_3;

    const existingUrls = existingLinks.map((link) => extractUrlsFromHtml(link)).flat();

    expect(checkForDuplicateLinks(existingUrls, deploymentLink)).toBe(false);
  });

  it("should return false if deployment link is empty", () => {
    const existingLinks = [HTML_LINK_1, HTML_LINK_2];
    const deploymentLink = "";

    const existingUrls = existingLinks.map((link) => extractUrlsFromHtml(link)).flat();

    expect(checkForDuplicateLinks(existingUrls, deploymentLink)).toBe(false);
  });

  it("should return true if deployment link exists, even with extra whitespace", () => {
    const existingLinks = [HTML_LINK_1, `<div><a href=" ${LINK_1} "><code>abcdef2</code></a></div>`];
    const deploymentLink = LINK_1;

    const existingUrls = existingLinks.map((link) => extractUrlsFromHtml(link)).flat();

    expect(checkForDuplicateLinks(existingUrls, deploymentLink)).toBe(true);
  });

  it("should return false if no matching link is found but URLs have different cases", () => {
    const existingLinks = [HTML_LINK_1, HTML_LINK_2];
    const deploymentLink = "https://LINK1.com";

    const existingUrls = existingLinks.map((link) => extractUrlsFromHtml(link)).flat();

    expect(checkForDuplicateLinks(existingUrls, deploymentLink)).toBe(false);
  });

  it("should return true if multiple instances of the same link exist", () => {
    const existingLinks = [HTML_LINK_1, `<div><a href="${LINK_1}"><code>abcdef2</code></a></div>`, `<div><a href="${LINK_1}"><code>abcdef3</code></a></div>`];
    const deploymentLink = LINK_1;

    const existingUrls = existingLinks.map((link) => extractUrlsFromHtml(link)).flat();

    expect(checkForDuplicateLinks(existingUrls, deploymentLink)).toBe(true);
  });

  it("should return false if the deployment link contains invalid URL format", () => {
    const existingLinks = [HTML_LINK_1, HTML_LINK_2];
    const deploymentLink = "ht://invalidlink.com";

    const existingUrls = existingLinks.map((link) => extractUrlsFromHtml(link)).flat();

    expect(checkForDuplicateLinks(existingUrls, deploymentLink)).toBe(false);
  });

  it("should return false if deployment link has no scheme", () => {
    const existingLinks = [HTML_LINK_1, HTML_LINK_2];
    const deploymentLink = "link3.com";

    const existingUrls = existingLinks.map((link) => extractUrlsFromHtml(link)).flat();

    expect(checkForDuplicateLinks(existingUrls, deploymentLink)).toBe(false);
  });
});

describe("extractUrlsFromHtml", () => {
  it("should extract a single URL from a simple anchor tag", () => {
    const html = `<a href="${LINK_1}">Link 1</a>`;
    const result = extractUrlsFromHtml(html);
    expect(result).toEqual([LINK_1]);
  });

  it("should extract multiple URLs from multiple anchor tags", () => {
    const html = `
      <a href="${LINK_1}">Link 1</a>
      <a href="${LINK_2}">Link 2</a>
      <a href="${LINK_3}">Link 3</a>
    `;
    const result = extractUrlsFromHtml(html);
    expect(result).toEqual([LINK_1, LINK_2, LINK_3]);
  });

  it("should handle URLs with query parameters", () => {
    const html = `<a href="${LINK_1}/page?query=param">Link 1</a>`;
    const result = extractUrlsFromHtml(html);
    expect(result).toEqual([`${LINK_1}/page?query=param`]);
  });

  it("should handle URLs with fragments (hashes)", () => {
    const html = `<a href="${LINK_1}/page#section">Link 1</a>`;
    const result = extractUrlsFromHtml(html);
    expect(result).toEqual([`${LINK_1}/page#section`]);
  });

  it("should handle URLs with ports", () => {
    const html = `<a href="${LINK_1}:8080">Link 1</a>`;
    const result = extractUrlsFromHtml(html);
    expect(result).toEqual([`${LINK_1}:8080`]);
  });

  it("should return an empty array when no URLs are found", () => {
    const html = "<p>No links here</p>";
    const result = extractUrlsFromHtml(html);
    expect(result).toEqual([]);
  });

  it("should extract URLs from complex HTML with embedded tags", () => {
    const html = `
      <div>
        <a href="${LINK_1}">Link 1</a>
        <p>Some content <a href="${LINK_2}">Link 2</a></p>
        <div><a href="${LINK_3}">Link 3</a></div>
      </div>
    `;
    const result = extractUrlsFromHtml(html);
    expect(result).toEqual([LINK_1, LINK_2, LINK_3]);
  });

  it("should handle empty input gracefully", () => {
    const html = "";
    const result = extractUrlsFromHtml(html);
    expect(result).toEqual([]);
  });

  it("should return an empty array if the URL is inside a script tag", () => {
    const html = `<script src="${LINK_1}/script.js"></script>`;
    const result = extractUrlsFromHtml(html);
    expect(result).toEqual([`${LINK_1}/script.js`]);
  });
});
