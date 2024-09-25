import { execSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
const ERROR_READING_FILE = "Error reading file:";

// @DEV: these credentials are all disposable and tightly scoped
// for the purposes of assisting pull request reviewers
// and posting continuous deployment links
// they lead to `auth` directory, a sibling of `src` directory here.
// <root>/auth

import path from "path";

const AUTH_DIR = "/home/runner/work/_actions/ubiquity/cloudflare-deploy-action/main/auth/";

export function getAppId() {
  try {
    const data = readFileSync(path.join(AUTH_DIR, "app-id"), "utf8");
    const trimmed = data.trim();
    return Number(trimmed);
  } catch (err) {
    console.error(ERROR_READING_FILE, err);
    return null;
  }
}

export function getInstallationId() {
  try {
    const data = readFileSync(path.join(AUTH_DIR, "installation-id"), "utf8");
    return data.trim();
  } catch (err) {
    console.error(ERROR_READING_FILE, err);
    return null;
  }
}

export function getPrivateKey() {
  try {
    const files = readdirSync(path.join(AUTH_DIR, "../auth"));
    const pemFile = files.find((file) => file.endsWith(".pem"));
    const data = pemFile ? readFileSync(path.join(AUTH_DIR, `${pemFile}`), "utf8") : null;
    return data ? data.trim() : null;
  } catch (err) {
    console.error(ERROR_READING_FILE, err);
    return null;
  }
}

export function printFileStructure(location: string) {
  const command = `find ${location} -not -path '*/node_modules/*'`;
  try {
    const stdout = execSync(command, { encoding: "utf8" });
    console.log(`File structure:\n${stdout}`);
  } catch (error) {
    console.error(`exec error: ${error}`);
  }
}
