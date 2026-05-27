import { Injectable, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import { loadCsv } from '../common/csv.util';

@Injectable()
export class ValidationService implements OnModuleInit {
  private allowedExtensions = new Set<string>();
  private cyberExtensions = new Set<string>();

  async onModuleInit() {
    const allowedPath = path.join(
      process.cwd(),
      'src/whitelists/AllowedFileTypes.csv',
    );

    const cyberPath = path.join(
      process.cwd(),
      'src/whitelists/CyberFileTypes.csv',
    );

    const allowedRows = await loadCsv(allowedPath);
    const cyberRows = await loadCsv(cyberPath);

    if (!allowedRows?.length) {
      throw new Error(`AllowedFileTypes CSV file failed to load: ${allowedPath}`);
    }

    if (!cyberRows?.length) {
      throw new Error(`cyberFileTypes CSV file failed to load: ${cyberPath}`);
    }

    const allowed = this.parseColumn(allowedRows, 'Extension');
    const cyber = this.parseColumn(cyberRows, 'File Extension');

    this.allowedExtensions = new Set(allowed);

    this.cyberExtensions = new Set(
      cyber.filter((ext) => !this.allowedExtensions.has(ext)),
    );
  }

  private parseColumn(rows: any[], columnName: string): string[] {
    return rows
      .flatMap((row) => {
        const value = row[columnName];
        if (!value) return [];

        return value.split(';').map((ext: string) => {
          const cleaned = ext.trim().toLowerCase();
          return cleaned.startsWith('.') ? cleaned : `.${cleaned}`;
        });
      })
      .filter(Boolean);
  }

  validateExtension(ext: string) {
    const normalizedExt = ext.toLowerCase();

    if (this.allowedExtensions.has(normalizedExt)) {
      return { state: 'allowed', messageId: 50 };
    }

    if (this.cyberExtensions.has(normalizedExt)) {
      return { state: 'cyber', messageId: 70 };
    }

    return { state: 'blocked', messageId: 0 };
  }
}