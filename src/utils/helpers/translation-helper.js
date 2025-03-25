import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadTranslations = (lang) => {
  try {
    const filePath = path.join(__dirname, '../../translations', `${lang}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading translations for ${lang}:`, error);
    return null;
  }
};

export default loadTranslations;
