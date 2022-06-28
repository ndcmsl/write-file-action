import { getInput, setFailed, setOutput } from '@actions/core';
import { mkdirP } from "@actions/io";
import { writeFileSync, appendFileSync, statSync } from 'fs';
import { dirname } from "path";

main().catch((error) => setFailed(error.message));

async function main() {
  try {
    const path = getInput("path", { required: true });
    const contents = getInput("contents", { required: true });
    const mode = (getInput("write-mode") || "append").toLocaleLowerCase();
    const contentType = getInput("contentType", { required: true });

    // Ensure the correct mode is specified
    if (mode !== "append" && mode !== "overwrite") {
      setFailed("Mode must be one of: overwrite or append");
      return;
    }

    const targetDir = dirname(path);

    await mkdirP(targetDir);

    if (mode === "overwrite") {
      let data;
      if (contentType === 'env') {
        data = contents.replaceAll(" ", "\n");
      }
      else if (contentType === 'ecosystem') {
        data = contents.replaceAll(', ', ',\n');
      }
      writeFileSync(path, data);
    } else {
      appendFileSync(path, contents);
    }

    const statResult = await statSync(path);
    setOutput("size", `${statResult.size}`);
  } catch (error: any) {
    setFailed(error.message);
  }
}