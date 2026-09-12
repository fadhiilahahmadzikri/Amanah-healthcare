import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

type PipelineOptions = {
  files: string[];
  dir?: string;
  recursive: boolean;
  watch: boolean;
  replaceRefs: boolean;
  dryRun: boolean;
  cleanSource: boolean;
  quality: number;
  lossless: boolean;
  effort: number;
  srcDir: string;
};

type ConversionResult = {
  sourcePath: string;
  targetPath: string;
  originalSize: number;
  newSize: number;
  savedBytes: number;
  savedPercent: number;
  dimensions: { width?: number; height?: number };
  hasAlpha?: boolean;
  action: 'converted' | 'skipped' | 'preview';
  reason?: string;
};

const EXCLUDED_FILENAMES = new Set([
  'favicon.ico',
  'apple-touch-icon.png',
  'favicon-16x16.png',
  'favicon-32x32.png',
]);

function parseArgs(): PipelineOptions {
  const args = process.argv.slice(2);
  const options: PipelineOptions = {
    files: [],
    recursive: true,
    watch: false,
    replaceRefs: false,
    dryRun: false,
    cleanSource: false,
    quality: 88,
    lossless: false,
    effort: 6,
    srcDir: path.resolve(process.cwd(), 'src'),
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--file' && i + 1 < args.length) {
      const nextArg = args[++i];
      if (nextArg) {
        options.files.push(path.resolve(process.cwd(), nextArg));
      }
    } else if (arg === '--files' && i + 1 < args.length) {
      const nextArg = args[++i];
      if (nextArg) {
        const paths = nextArg.split(',').map(p => path.resolve(process.cwd(), p.trim()));
        options.files.push(...paths);
      }
    } else if (arg === '--dir' && i + 1 < args.length) {
      const nextArg = args[++i];
      if (nextArg) {
        options.dir = path.resolve(process.cwd(), nextArg);
      }
    } else if (arg === '--no-recursive') {
      options.recursive = false;
    } else if (arg === '--watch') {
      options.watch = true;
    } else if (arg === '--replace-refs') {
      options.replaceRefs = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--clean-source') {
      options.cleanSource = true;
    } else if (arg === '--quality' && i + 1 < args.length) {
      const nextArg = args[++i];
      if (nextArg) {
        options.quality = Number.parseInt(nextArg, 10);
      }
    } else if (arg === '--lossless') {
      options.lossless = true;
    } else if (arg === '--effort' && i + 1 < args.length) {
      const nextArg = args[++i];
      if (nextArg) {
        options.effort = Number.parseInt(nextArg, 10);
      }
    } else if (arg === '--src-dir' && i + 1 < args.length) {
      const nextArg = args[++i];
      if (nextArg) {
        options.srcDir = path.resolve(process.cwd(), nextArg);
      }
    }
  }

  return options;
}

function isRasterCandidate(filePath: string): boolean {
  const basename = path.basename(filePath);
  if (EXCLUDED_FILENAMES.has(basename)) {
    return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
}

function collectFilesFromDir(dirPath: string, recursive: boolean): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files: string[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (recursive) {
        files.push(...collectFilesFromDir(fullPath, recursive));
      }
    } else if (entry.isFile() && isRasterCandidate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function convertImage(
  sourcePath: string,
  options: PipelineOptions,
): Promise<ConversionResult> {
  const ext = path.extname(sourcePath);
  const targetPath = `${sourcePath.slice(0, -ext.length)}.webp`;
  const originalSize = fs.statSync(sourcePath).size;

  const image = sharp(sourcePath);
  const metadata = await image.metadata();

  const isPng = ext.toLowerCase() === '.png';
  const hasAlpha = Boolean(metadata.hasAlpha);

  const webpOptions: sharp.WebpOptions = {
    effort: options.effort,
    smartSubsample: true,
  };

  if (options.lossless) {
    webpOptions.lossless = true;
  } else if (isPng && hasAlpha) {
    // Preserve transparent portraits/graphics with high fidelity & alpha
    webpOptions.quality = Math.max(options.quality, 90);
    webpOptions.alphaQuality = 100;
  } else {
    webpOptions.quality = options.quality;
  }

  if (options.dryRun) {
    return {
      sourcePath,
      targetPath,
      originalSize,
      newSize: 0,
      savedBytes: 0,
      savedPercent: 0,
      dimensions: { width: metadata.width, height: metadata.height },
      hasAlpha,
      action: 'preview',
    };
  }

  let pipeline = sharp(sourcePath);
  if (metadata.icc) {
    pipeline = pipeline.withMetadata();
  }

  const outputBuffer = await pipeline.webp(webpOptions).toBuffer();
  fs.writeFileSync(targetPath, outputBuffer);

  const newSize = outputBuffer.length;
  const savedBytes = originalSize - newSize;
  const savedPercent = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;

  return {
    sourcePath,
    targetPath,
    originalSize,
    newSize,
    savedBytes,
    savedPercent,
    dimensions: { width: metadata.width, height: metadata.height },
    hasAlpha,
    action: 'converted',
  };
}

function rewireReferences(
  conversionMap: Map<string, string>,
  searchDir: string,
  dryRun: boolean,
): { modifiedFiles: string[]; totalReplacements: number } {
  const fileExts = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.md']);
  const modifiedFiles: string[] = [];
  let totalReplacements = 0;

  function scan(dir: string) {
    if (!fs.existsSync(dir)) {
      return;
    }
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
          scan(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (fileExts.has(ext)) {
          let content = fs.readFileSync(fullPath, 'utf8');
          let fileHasReplacements = false;

          for (const [sourceFile, targetFile] of conversionMap.entries()) {
            const sourceBase = path.basename(sourceFile);
            const targetBase = path.basename(targetFile);

            if (content.includes(sourceBase)) {
              const regex = new RegExp(sourceBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
              const matchCount = (content.match(regex) || []).length;
              if (matchCount > 0) {
                content = content.replace(regex, targetBase);
                totalReplacements += matchCount;
                fileHasReplacements = true;
              }
            }
          }

          if (fileHasReplacements) {
            modifiedFiles.push(fullPath);
            if (!dryRun) {
              fs.writeFileSync(fullPath, content, 'utf8');
            }
          }
        }
      }
    }
  }

  scan(searchDir);
  return { modifiedFiles, totalReplacements };
}

function cleanSourceRasters(conversionResults: ConversionResult[], dryRun: boolean): number {
  let deletedCount = 0;
  for (const res of conversionResults) {
    if (fs.existsSync(res.targetPath) && fs.existsSync(res.sourcePath)) {
      const targetSize = fs.statSync(res.targetPath).size;
      // Verification check: only remove if .webp exists and is not empty
      if (targetSize > 0) {
        if (!dryRun) {
          fs.unlinkSync(res.sourcePath);
        }
        deletedCount++;
      }
    }
  }
  return deletedCount;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function run() {
  const options = parseArgs();

  let targetFiles: string[] = [...options.files];
  if (options.dir) {
    targetFiles.push(...collectFilesFromDir(options.dir, options.recursive));
  }

  // Deduplicate
  targetFiles = Array.from(new Set(targetFiles));

  if (targetFiles.length === 0) {
    console.log('No raster candidate images found to process.');
    process.exit(0);
  }

  console.log(`[ImagePipeline] Found ${targetFiles.length} candidate image(s).`);
  console.log(`[ImagePipeline] Mode: ${options.dryRun ? 'DRY-RUN' : 'EXECUTE'}`);
  console.log(`[ImagePipeline] Quality: ${options.quality} | Lossless: ${options.lossless} | Effort: ${options.effort}`);

  const results: ConversionResult[] = [];
  const conversionMap = new Map<string, string>();

  let totalOriginal = 0;
  let totalNew = 0;

  for (const filePath of targetFiles) {
    try {
      const res = await convertImage(filePath, options);
      results.push(res);
      conversionMap.set(res.sourcePath, res.targetPath);
      totalOriginal += res.originalSize;
      totalNew += res.newSize;

      const filename = path.basename(res.sourcePath);
      if (options.dryRun) {
        console.log(`  [PREVIEW] ${filename} (${formatBytes(res.originalSize)}) -> .webp [${res.dimensions.width}x${res.dimensions.height}${res.hasAlpha ? ' +alpha' : ''}]`);
      } else {
        console.log(`  [OK] ${filename}: ${formatBytes(res.originalSize)} -> ${formatBytes(res.newSize)} (-${res.savedPercent.toFixed(1)}%)`);
      }
    } catch (err) {
      console.error(`  [ERROR] Failed to convert ${filePath}:`, err);
    }
  }

  if (!options.dryRun) {
    const totalSaved = totalOriginal - totalNew;
    const totalSavedPct = totalOriginal > 0 ? (totalSaved / totalOriginal) * 100 : 0;
    console.log('\n--- Conversion Summary ---');
    console.log(`Total Original Size: ${formatBytes(totalOriginal)}`);
    console.log(`Total WebP Size:     ${formatBytes(totalNew)}`);
    console.log(`Total Space Saved:   ${formatBytes(totalSaved)} (-${totalSavedPct.toFixed(1)}%)`);
  }

  if (options.replaceRefs) {
    console.log(`\n[ImagePipeline] Rewiring references in: ${options.srcDir}`);
    const { modifiedFiles, totalReplacements } = rewireReferences(
      conversionMap,
      options.srcDir,
      options.dryRun,
    );
    console.log(`[ImagePipeline] Replaced ${totalReplacements} reference(s) across ${modifiedFiles.length} file(s).`);
    for (const f of modifiedFiles) {
      console.log(`  - ${path.relative(process.cwd(), f)}`);
    }
  }

  if (options.cleanSource) {
    console.log('\n[ImagePipeline] Cleaning source raster files...');
    const deletedCount = cleanSourceRasters(results, options.dryRun);
    console.log(`[ImagePipeline] ${options.dryRun ? 'Would delete' : 'Deleted'} ${deletedCount} source file(s).`);
  }

  if (options.watch && options.dir) {
    console.log(`\n[ImagePipeline] Watching ${options.dir} for image additions/changes... (Press Ctrl+C to stop)`);
    fs.watch(options.dir, { recursive: options.recursive }, async (_eventType, filename) => {
      if (!filename) {
        return;
      }
      const fullPath = path.join(options.dir!, filename);
      if (isRasterCandidate(fullPath) && fs.existsSync(fullPath)) {
        console.log(`[Watch] Detected change in: ${filename}`);
        try {
          const res = await convertImage(fullPath, options);
          console.log(`[Watch] Converted ${filename} -> .webp (-${res.savedPercent.toFixed(1)}%)`);
          if (options.replaceRefs) {
            const singleMap = new Map([[res.sourcePath, res.targetPath]]);
            rewireReferences(singleMap, options.srcDir, false);
          }
        } catch (e) {
          console.error(`[Watch] Error converting ${filename}:`, e);
        }
      }
    });
  }
}

run().catch((err) => {
  console.error('[ImagePipeline] Fatal Error:', err);
  process.exit(1);
});
