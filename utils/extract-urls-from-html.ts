export function extractUrlsFromHtml(html: string): string[] {
  const regex = /https?:\/\/[^\s"'>]+/g;
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    matches.push(match[0]);
  }

  return matches;
}
