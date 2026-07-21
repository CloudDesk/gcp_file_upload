import { execFile } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import util from "util";

const execFileAsync = util.promisify(execFile);

export const removeTrailingBlankPdfPages = async (pdfFilePath: string) => {
  try {
    if (!fs.existsSync(pdfFilePath)) {
      return;
    }

    const { stdout: infoOutput } = await execFileAsync("pdfinfo", [pdfFilePath]);
    const pageMatch = infoOutput.match(/^Pages:\s+(\d+)/m);
    const pageCount = pageMatch ? Number(pageMatch[1]) : 0;

    if (!Number.isFinite(pageCount) || pageCount <= 1) {
      return;
    }

    let lastContentPage = 0;
    for (let page = pageCount; page >= 1; page -= 1) {
      if (!(await isPdfPageVisuallyBlank(pdfFilePath, page))) {
        lastContentPage = page;
        break;
      }
    }

    if (lastContentPage >= pageCount || lastContentPage <= 0) {
      return;
    }

    const { PDFDocument } = await import("pdf-lib");
    const sourceBuffer = fs.readFileSync(pdfFilePath);
    const sourceBytes = sourceBuffer.buffer.slice(
      sourceBuffer.byteOffset,
      sourceBuffer.byteOffset + sourceBuffer.byteLength
    ) as ArrayBuffer;
    const sourcePdf = await PDFDocument.load(sourceBytes);
    const trimmedPdf = await PDFDocument.create();
    const copiedPages = await trimmedPdf.copyPages(
      sourcePdf,
      Array.from({ length: lastContentPage }, (_, index) => index)
    );

    copiedPages.forEach((page) => trimmedPdf.addPage(page));
    fs.writeFileSync(pdfFilePath, await trimmedPdf.save());
    console.log(
      `Removed ${pageCount - lastContentPage} trailing blank page(s) from ${pdfFilePath}`
    );
  } catch (error: any) {
    console.error(
      `Trailing blank PDF page cleanup skipped for ${pdfFilePath}:`,
      error?.message || error
    );
  }
};

const isPdfPageVisuallyBlank = async (pdfFilePath: string, page: number) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "revo-pdf-page-"));

  try {
    const pagePrefix = path.join(tempDir, `page-${page}`);
    const pgmFilePath = `${pagePrefix}.pgm`;

    await execFileAsync("pdftoppm", [
      "-f",
      String(page),
      "-l",
      String(page),
      "-singlefile",
      "-r",
      "18",
      "-gray",
      pdfFilePath,
      pagePrefix,
    ]);

    const imageBuffer = fs.readFileSync(pgmFilePath);
    const pixelOffset = getPgmPixelDataOffset(imageBuffer);
    if (pixelOffset <= 0 || pixelOffset >= imageBuffer.length) {
      return false;
    }

    let nonWhitePixels = 0;
    const totalPixels = imageBuffer.length - pixelOffset;
    for (let index = pixelOffset; index < imageBuffer.length; index += 1) {
      if (imageBuffer[index] < 245) {
        nonWhitePixels += 1;
      }
    }

    return nonWhitePixels / Math.max(totalPixels, 1) < 0.0002;
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup failures
    }
  }
};

const getPgmPixelDataOffset = (buffer: Buffer) => {
  let index = 0;
  let tokensRead = 0;

  while (index < buffer.length && tokensRead < 4) {
    while (
      index < buffer.length &&
      (buffer[index] === 9 ||
        buffer[index] === 10 ||
        buffer[index] === 13 ||
        buffer[index] === 32)
    ) {
      index += 1;
    }

    if (buffer[index] === 35) {
      while (index < buffer.length && buffer[index] !== 10) {
        index += 1;
      }
      continue;
    }

    while (
      index < buffer.length &&
      buffer[index] !== 9 &&
      buffer[index] !== 10 &&
      buffer[index] !== 13 &&
      buffer[index] !== 32
    ) {
      index += 1;
    }

    tokensRead += 1;
  }

  while (
    index < buffer.length &&
    (buffer[index] === 9 ||
      buffer[index] === 10 ||
      buffer[index] === 13 ||
      buffer[index] === 32)
  ) {
    index += 1;
  }

  return index;
};
