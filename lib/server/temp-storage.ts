import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

export interface TempFileJob {
  jobId: string;
  jobDir: string;
  inputPath: string;
  outputPath: string;
}

export class TempStorage {
  private static readonly BASE_DIR = path.join(os.tmpdir(), "everything-file-secure-temp");

  /**
   * Initializes the base temporary directory outside the web root
   */
  public static initBaseDir(): void {
    if (!fs.existsSync(this.BASE_DIR)) {
      fs.mkdirSync(this.BASE_DIR, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Allocates an isolated temporary workspace for a conversion job.
   * Generates cryptographically secure internal random filenames.
   * Never uses client-provided filenames as server filesystem paths.
   */
  public static async createJob(
    inputExt: string,
    outputExt: string,
    inputBuffer: Uint8Array | Buffer
  ): Promise<TempFileJob> {
    this.initBaseDir();

    const jobId = crypto.randomUUID();
    const jobDir = path.join(this.BASE_DIR, jobId);

    // Create job-specific isolated directory with restricted permissions (0700)
    await fs.promises.mkdir(jobDir, { mode: 0o700 });

    const safeInputExt = inputExt.startsWith(".") ? inputExt : `.${inputExt}`;
    const safeOutputExt = outputExt.startsWith(".") ? outputExt : `.${outputExt}`;

    const inputPath = path.join(jobDir, `input_${crypto.randomBytes(8).toString("hex")}${safeInputExt}`);
    const outputPath = path.join(jobDir, `output_${crypto.randomBytes(8).toString("hex")}${safeOutputExt}`);

    // Write input payload safely
    await fs.promises.writeFile(inputPath, inputBuffer, { mode: 0o600 });

    return {
      jobId,
      jobDir,
      inputPath,
      outputPath,
    };
  }

  /**
   * Immediately destroys all temporary files and the job directory.
   */
  public static async purgeJob(job: TempFileJob): Promise<void> {
    try {
      if (fs.existsSync(job.jobDir)) {
        await fs.promises.rm(job.jobDir, { recursive: true, force: true });
      }
    } catch (err) {
      // Quiet fail on already removed files, but do not leak error
    }
  }
}
