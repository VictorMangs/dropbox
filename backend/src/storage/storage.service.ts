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
    const intendedBase = path.join(
      this.basePath,
      'uploads',
      sessionId,
    )

    const fullPath = path.resolve(
      intendedBase,
      relativePath,
    )

    const resolvedBase = path.resolve(
      intendedBase,
    )

    if (
      !fullPath.startsWith(
        resolvedBase + path.sep,
      ) &&
      fullPath !== resolvedBase
    ) {
      throw new Error(
        'Invalid relative path',
      )
    }

    const directory =
      path.dirname(fullPath)

    await fs.mkdir(directory, {
      recursive: true,
    })

    await fs.writeFile(fullPath, buffer)

    return fullPath
  }
}