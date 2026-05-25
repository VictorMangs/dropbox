import * as fs from 'fs'
import * as path from 'path'
import Papa from 'papaparse'
import { Injectable, OnModuleInit } from '@nestjs/common'

export interface MessageRule {
  id: number
  type: string
  action: string
  message: string
}

@Injectable()
export class MessagesService implements OnModuleInit {
  private messages = new Map<number, MessageRule>()

  async onModuleInit() {
    const filePath = path.join(
      process.cwd(),
      'src/whitelists/Messages.csv',
    )

    const file = fs.readFileSync(filePath, 'utf-8')

    const parsed = Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
    })

    for (const row of parsed.data as any[]) {
      const id = Number(row.ID)

      this.messages.set(id, {
        id,
        type: row.Type,
        action: row.Action,
        message: row.Message,
      })
    }
  }

  getMessage(id: number) {
    return this.messages.get(id)
  }
}