import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

@Injectable()
export class ValidationService implements OnModuleInit {
  private allowedExtensions: Set<string> = new Set();
  private cyberExtensions: Set<string> = new Set();

  async onModuleInit() {
    await this.loadConfigurations();
  }

  private async loadConfigurations() {
    const allowedPath = path.join(
      process.cwd(),
      'src/whitelists/AllowedFileTypes.csv',
    );
    const cyberPath = path.join(
      process.cwd(),
      'src/whitelists/CyberFileTypes.csv',
    );

    // Read files and parse specific columns
    const allowed = this.parseCsvWithColumn(
      fs.readFileSync(allowedPath, 'utf-8'),
      'Extension',
    );
    const cyber = this.parseCsvWithColumn(
      fs.readFileSync(cyberPath, 'utf-8'),
      'File Extention',
    );

    // Allowed is everything in AllowedFileTypes
    this.allowedExtensions = new Set(allowed);

    // Cyber is anything in CyberFileTypes that's NOT in AllowedFileTypes
    this.cyberExtensions = new Set(
      cyber.filter((ext) => !this.allowedExtensions.has(ext)),
    );
  }

  // New helper replacing your old parseCsv method
  private parseCsvWithColumn(
    fileContent: string,
    columnName: string,
  ): string[] {
    const parsed = Papa.parse<Record<string, string>>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    // Use flatMap instead of map to split semicolon-separated values
    return parsed.data
      .flatMap((row) => {
        const value = row[columnName];
        if (!value) return []; // Return empty array so flatMap ignores it

        // Split by semicolon to handle rows like ".doc;.docx"
        return value.split(';').map((ext) => {
          const cleaned = ext.trim().toLowerCase();
          if (!cleaned) return '';

          // Ensures uniform '.ext' format matching your validation logic
          return cleaned.startsWith('.') ? cleaned : `.${cleaned}`;
        });
      })
      .filter(Boolean); // Removes any empty strings from the final list
  }

  validateExtension(ext: string) {
    const normalizedExt = ext.toLowerCase();

    // 1. Check if it's in the allowed whitelist
    if (this.allowedExtensions.has(normalizedExt)) {
      return {
        state: 'allowed',
        messageId: 50,
      };
    }

    // 2. Check if it's in the cyber routing list
    if (this.cyberExtensions.has(normalizedExt)) {
      return {
        state: 'cyber',
        messageId: 70,
      };
    }

    // 3. Everything else is blocked (White-list approach)
    return {
      state: 'blocked',
      messageId: 0,
    };
  }
}
