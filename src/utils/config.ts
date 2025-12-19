import * as fs from "fs/promises";
import * as path from "path";

/**
 * Đọc git config
 */
export async function readConfig(gitDir: string): Promise<Record<string, any>> {
  const configPath = path.join(gitDir, "config");

  try {
    const content = await fs.readFile(configPath, "utf-8");
    const config: Record<string, any> = {};

    // Parse simple INI format
    let currentSection = "";
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        currentSection = trimmed.slice(1, -1);
        config[currentSection] = {};
      } else if (trimmed.includes("=") && currentSection) {
        const [key, value] = trimmed.split("=").map((s: string) => s.trim());
        if (!config[currentSection]) {
          config[currentSection] = {};
        }
        config[currentSection][key] = value;
      }
    }

    return config;
  } catch {
    return {};
  }
}

/**
 * Ghi git config
 */
export async function writeConfig(
  gitDir: string,
  config: Record<string, any>
): Promise<void> {
  const configPath = path.join(gitDir, "config");
  const lines: string[] = [];

  for (const [section, values] of Object.entries(config)) {
    lines.push(`[${section}]`);
    for (const [key, value] of Object.entries(values)) {
      lines.push(`\t${key} = ${value}`);
    }
  }

  await fs.writeFile(configPath, lines.join("\n") + "\n", "utf-8");
}
