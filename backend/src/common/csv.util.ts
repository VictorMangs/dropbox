import * as fs from 'fs';
import Papa from 'papaparse';

export async function loadCsv(filePath: string) {
  const file = await fs.promises.readFile(filePath, 'utf-8');

  return Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
  }).data as any[];
}