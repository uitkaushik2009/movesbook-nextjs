import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Fetch all languages and translations
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      include: {
        translations: true,
      },
      orderBy: { code: 'asc' },
    });

    // Build translations structure
    const translationsData: Record<string, Record<string, string>> = {};
    
    for (const lang of languages) {
      translationsData[lang.code] = {};
      for (const trans of lang.translations) {
        translationsData[lang.code][trans.key] = trans.value;
      }
    }

    // Generate i18n.ts content for English (default language)
    const englishData = translationsData['en'] || {};
    const englishKeys = Object.keys(englishData).sort();
    
    let i18nContent = `// Auto-generated from database - DO NOT EDIT MANUALLY\n`;
    i18nContent += `// Last exported: ${new Date().toISOString()}\n\n`;
    i18nContent += `export interface LanguageStrings {\n`;
    for (const key of englishKeys) {
      i18nContent += `  '${key}': string;\n`;
    }
    i18nContent += `}\n\n`;
    i18nContent += `export interface Language {\n`;
    i18nContent += `  code: string;\n`;
    i18nContent += `  name: string;\n`;
    i18nContent += `  strings: LanguageStrings;\n`;
    i18nContent += `}\n\n`;
    i18nContent += `class I18nService {\n`;
    i18nContent += `  private currentLanguage = 'en';\n`;
    i18nContent += `  private languages: Language[] = [];\n`;
    i18nContent += `  private listeners: Set<() => void> = new Set();\n\n`;
    i18nContent += `  constructor() {\n`;
    i18nContent += `    this.initializeDefaultLanguages();\n`;
    i18nContent += `  }\n\n`;
    i18nContent += `  private initializeDefaultLanguages() {\n`;
    i18nContent += `    const englishStrings: LanguageStrings = {\n`;
    
    for (const key of englishKeys) {
      const value = englishData[key].replace(/'/g, "\\'");
      i18nContent += `        '${key}': '${value}',\n`;
    }
    
    i18nContent += `    };\n\n`;
    i18nContent += `    this.languages = [{\n`;
    i18nContent += `      code: 'en',\n`;
    i18nContent += `      name: 'English',\n`;
    i18nContent += `      strings: englishStrings,\n`;
    i18nContent += `    }];\n`;
    i18nContent += `  }\n\n`;
    i18nContent += `  t(key: string): string {\n`;
    i18nContent += `    const lang = this.languages.find(l => l.code === this.currentLanguage);\n`;
    i18nContent += `    return lang?.strings[key as keyof LanguageStrings] || \`[\${key}]\`;\n`;
    i18nContent += `  }\n\n`;
    i18nContent += `  setLanguage(code: string) {\n`;
    i18nContent += `    this.currentLanguage = code;\n`;
    i18nContent += `    this.notifyListeners();\n`;
    i18nContent += `  }\n\n`;
    i18nContent += `  getCurrentLanguage(): string {\n`;
    i18nContent += `    return this.currentLanguage;\n`;
    i18nContent += `  }\n\n`;
    i18nContent += `  getLanguages(): Language[] {\n`;
    i18nContent += `    return this.languages;\n`;
    i18nContent += `  }\n\n`;
    i18nContent += `  subscribe(listener: () => void) {\n`;
    i18nContent += `    this.listeners.add(listener);\n`;
    i18nContent += `    return () => this.listeners.delete(listener);\n`;
    i18nContent += `  }\n\n`;
    i18nContent += `  private notifyListeners() {\n`;
    i18nContent += `    this.listeners.forEach(listener => listener());\n`;
    i18nContent += `  }\n`;
    i18nContent += `}\n\n`;
    i18nContent += `export const i18n = new I18nService();\n`;

    // Write i18n.ts file
    const i18nPath = path.join(process.cwd(), 'src', 'lib', 'i18n.ts');
    await fs.writeFile(i18nPath, i18nContent, 'utf-8');

    // Generate translations.ts for other languages
    let translationsContent = `// Auto-generated from database - DO NOT EDIT MANUALLY\n`;
    translationsContent += `// Last exported: ${new Date().toISOString()}\n\n`;
    translationsContent += `import { LanguageStrings } from './i18n';\n\n`;

    const otherLanguages = languages.filter(l => l.code !== 'en');
    
    for (const lang of otherLanguages) {
      const langData = translationsData[lang.code] || {};
      translationsContent += `export function get${capitalize(getLangName(lang.code))}Strings(): LanguageStrings {\n`;
      translationsContent += `  return {\n`;
      
      for (const key of englishKeys) {
        const value = (langData[key] || '').replace(/'/g, "\\'");
        translationsContent += `    '${key}': '${value}',\n`;
      }
      
      translationsContent += `  };\n`;
      translationsContent += `}\n\n`;
    }

    // Write translations.ts file
    const translationsPath = path.join(process.cwd(), 'src', 'lib', 'translations.ts');
    await fs.writeFile(translationsPath, translationsContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Translations exported to static files successfully',
      filesWritten: ['src/lib/i18n.ts', 'src/lib/translations.ts'],
    });
  } catch (error) {
    console.error('Error exporting translations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export translations' },
      { status: 500 }
    );
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getLangName(code: string): string {
  const names: Record<string, string> = {
    'es': 'spanish',
    'zh': 'chinese',
    'hi': 'hindi',
    'ar': 'arabic',
    'pt': 'portuguese',
    'it': 'italian',
    'ru': 'russian',
    'fr': 'french',
    'de': 'german',
  };
  return names[code] || code;
}

