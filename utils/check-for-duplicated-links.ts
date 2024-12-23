export function checkForDuplicateLinks(existingLinks: string[], deploymentLink: string): boolean {
  return existingLinks.includes(deploymentLink);
}
