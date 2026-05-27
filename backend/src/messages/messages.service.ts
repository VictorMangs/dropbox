import { Injectable, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import { loadCsv } from '../common/csv.util';

export interface MessageRule {
  id: number;
  type: string;
  action: string;
  message: string;
}

@Injectable()
export class MessagesService implements OnModuleInit {
  private messages = new Map<number, MessageRule>();

  async onModuleInit() {
    const filePath = path.join(
      process.cwd(),
      'src/whitelists/Messages.csv',
    );

    const rows = await loadCsv(filePath);

    for (const row of rows) {
      const id = Number(row.ID);

      this.messages.set(id, {
        id,
        type: row.Type,
        action: row.Action,
        message: row.Message,
      });
    }
  }

  getMessage(id: number) {
    return this.messages.get(id);
  }
}
