import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import https from 'https';
import { generateFoodImagePrompt, FoodItemPromptInput } from './promptGenerator';

const execFileAsync = promisify(execFile);

export interface GenerateImageOptions {
  canteenSlug: string;
  forceRegenerate?: boolean;
}

export interface GeneratedImageResult {
  imageUrl: string;
  clientPath: string;
  serverPath: string;
  prompt: string;
  provider: string;
  alreadyExisted: boolean;
}

export function normalizeFoodFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .concat('.webp');
}

export class ImageService {
  private provider: string;
  private apiKey: string;
  private clientFoodDir: string;
  private serverFoodDir: string;

  constructor() {
    this.provider = (process.env.IMAGE_GENERATION_PROVIDER || 'local').toLowerCase();
    this.apiKey = process.env.IMAGE_GENERATION_API_KEY || '';

    const root = path.resolve(__dirname, '../../../../');
    this.clientFoodDir = path.join(root, 'client/public/food');
    this.serverFoodDir = path.join(root, 'server/public/food');
  }

  public getProvider(): string {
    return this.provider;
  }

  public async generateFoodImage(
    item: FoodItemPromptInput,
    options: GenerateImageOptions
  ): Promise<GeneratedImageResult> {
    const canteenSlug = options.canteenSlug || 'ground-floor';
    const filename = normalizeFoodFilename(item.name);

    const clientDir = path.join(this.clientFoodDir, canteenSlug);
    const serverDir = path.join(this.serverFoodDir, canteenSlug);

    fs.mkdirSync(clientDir, { recursive: true });
    fs.mkdirSync(serverDir, { recursive: true });

    const clientPath = path.join(clientDir, filename);
    const serverPath = path.join(serverDir, filename);
    const relativeUrl = `/food/${canteenSlug}/${filename}`;

    const prompt = generateFoodImagePrompt(item);

    if (!options.forceRegenerate && fs.existsSync(clientPath) && fs.statSync(clientPath).size > 1000) {
      if (!fs.existsSync(serverPath)) {
        fs.copyFileSync(clientPath, serverPath);
      }
      return {
        imageUrl: relativeUrl,
        clientPath,
        serverPath,
        prompt,
        provider: this.provider,
        alreadyExisted: true,
      };
    }

    if (this.provider === 'openai' && this.apiKey) {
      await this.generateWithOpenAI(prompt, clientPath);
    } else if (this.provider === 'stability' && this.apiKey) {
      await this.generateWithStability(prompt, clientPath);
    } else if (this.provider === 'imagen' && this.apiKey) {
      await this.generateWithImagen(prompt, clientPath);
    } else {
      await this.generateWithLocalRenderer(item, clientPath);
    }

    fs.copyFileSync(clientPath, serverPath);

    return {
      imageUrl: relativeUrl,
      clientPath,
      serverPath,
      prompt,
      provider: this.provider,
      alreadyExisted: false,
    };
  }

  private async generateWithLocalRenderer(item: FoodItemPromptInput, outputPath: string): Promise<void> {
    const candidatePaths = [
      path.resolve(__dirname, 'localFoodRenderer.py'),
      path.resolve(process.cwd(), 'src/services/aiImage/localFoodRenderer.py'),
      path.resolve(__dirname, '../../src/services/aiImage/localFoodRenderer.py'),
      path.resolve(__dirname, '../../../src/services/aiImage/localFoodRenderer.py'),
    ];
    const pythonScript = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];
    const tags = (item.tags || []).join(',');
    const category = item.categorySlug || item.categoryName || '';

    await execFileAsync('python', [
      pythonScript,
      '--name',
      item.name,
      '--category',
      category,
      '--tags',
      tags,
      '--output',
      outputPath,
    ]);

    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 500) {
      throw new Error(`Failed to generate image for ${item.name}`);
    }
  }

  private async generateWithOpenAI(prompt: string, outputPath: string): Promise<void> {
    const postData = JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    });

    return new Promise((resolve, reject) => {
      const req = https.request(
        'https://api.openai.com/v1/images/generations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Length': Buffer.byteLength(postData),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              if (res.statusCode !== 200) {
                return reject(new Error(`OpenAI error: ${data}`));
              }
              const json = JSON.parse(data);
              const base64 = json.data?.[0]?.b64_json;
              if (!base64) return reject(new Error('No image returned from OpenAI'));
              fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'));
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        }
      );
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  private async generateWithStability(prompt: string, outputPath: string): Promise<void> {
    throw new Error('Stability AI requires external credentials; please configure IMAGE_GENERATION_API_KEY');
  }

  private async generateWithImagen(prompt: string, outputPath: string): Promise<void> {
    throw new Error('Google Imagen requires vertex credentials; please configure IMAGE_GENERATION_API_KEY');
  }
}

export const imageService = new ImageService();
