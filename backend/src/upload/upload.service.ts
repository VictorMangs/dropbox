import { Injectable } from '@nestjs/common'

import * as path from 'path'

import * as fs from 'fs'

import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'

import { ValidationService } from './validation.service'

import {
  NotFoundException,
} from '@nestjs/common'



@Injectable()
export class UploadService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private validationService: ValidationService,
  ) {}

  async createSession() {
    return this.prisma.uploadSession.create({
      data: {},
    })
  }

  async getSession(
    sessionId: string,
    ) {
    const session =
        await this.prisma.uploadSession.findUnique({
        where: {
            id: sessionId,
        },

        include: {
            files: {
                orderBy: {
                    relativePath: 'asc',
                },
            },
        },
        })

    if (!session) {
        throw new NotFoundException(
        'Upload session not found',
        )
    }

    return session
    }
  async uploadFile(
    sessionId: string,
    file: Express.Multer.File,
    relativePath: string,
  ) {

    await this.prisma.uploadSession.findUniqueOrThrow({
    where: {
        id: sessionId,
    },
    })

    const session =
        await this.prisma.uploadSession.findUnique({
            where: {
            id: sessionId,
            },
        })

        if (!session) {
        throw new NotFoundException(
            'Upload session not found',
        )
        }

    const extension = path.extname(
      file.originalname,
    )

    const validation =
      this.validationService.validateExtension(
        extension,
      )

    const storedPath =
      await this.storageService.saveFile(
        sessionId,
        relativePath,
        file.buffer,
      )

    const saved =
      await this.prisma.fileRecord.create({
        data: {
          sessionId,

          originalName:
            file.originalname,

          relativePath,

          extension,

          storedPath,

          validationState:
            validation.state,

          validationMessage:
            validation.message,
        },
      })

    return saved
  }

  async uploadChunk({
    sessionId,
    chunk,
    chunkIndex,
    totalChunks,
    relativePath,
    fileId,
  }: {
    sessionId: string

    chunk: Express.Multer.File

    chunkIndex: number

    totalChunks: number

    relativePath: string

    fileId: string
  }) {
    const chunkDir =
      path.join(
        process.cwd(),
        'storage',
        'chunks',
        fileId,
      )

    await fs.promises.mkdir(
      chunkDir,
      {
        recursive: true,
      },
    )

    const chunkPath =
      path.join(
        chunkDir,
        `${chunkIndex}.part`,
      )

    await fs.promises.writeFile(
      chunkPath,
      chunk.buffer,
    )

    const uploadedChunks =
      await fs.promises.readdir(
        chunkDir,
      )

    if (
      uploadedChunks.length ===
      totalChunks
    ) {
      await this.assembleChunks({
        chunkDir,
        relativePath,
        sessionId,
        totalChunks,
      })
    }

    return {
      success: true,
      chunkIndex,
    }
  }

  private async assembleChunks({
    chunkDir,
    relativePath,
    sessionId,
    totalChunks,
  }: {
    chunkDir: string

    relativePath: string

    sessionId: string

    totalChunks: number
  }) {
    const finalPath =
      path.join(
        process.cwd(),
        'storage',
        'uploads',
        sessionId,
        relativePath,
      )

    await fs.promises.mkdir(
      path.dirname(
        finalPath,
      ),
      {
        recursive: true,
      },
    )

    const writeStream =
      fs.createWriteStream(
        finalPath,
      )

    for (
      let i = 0;
      i < totalChunks;
      i++
    ) {
      const chunkPath =
        path.join(
          chunkDir,
          `${i}.part`,
        )

      const data =
        await fs.promises.readFile(
          chunkPath,
        )

      writeStream.write(data)
    }

    writeStream.end()
  }
}
