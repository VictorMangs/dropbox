import {
  Injectable,
} from '@nestjs/common'

import * as fs from 'fs/promises'
import * as path from 'path'

@Injectable()
export class StorageService {
  private readonly basePath =
    path.join(process.cwd(), 'storage')

  async saveFile(
    sessionId: string,
    relativePath: string,
    buffer: Buffer,
  ) {
    const normalizedPath =
      path.normalize(relativePath)

    if (normalizedPath.includes('..')) {
    throw new Error(
        'Invalid relative path',
    )
    }

    const fullPath = path.join(
      this.basePath,
      'uploads',
      sessionId,
      normalizedPath,
    )

    const directory =
      path.dirname(fullPath)

    await fs.mkdir(directory, {
      recursive: true,
    })

    await fs.writeFile(fullPath, buffer)

    return fullPath
  }
}