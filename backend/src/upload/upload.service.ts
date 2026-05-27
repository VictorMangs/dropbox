import { Injectable } from '@nestjs/common';
import * as path from 'path';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { MessagesService } from '../messages/messages.service';

import { ValidationService } from './validation.service';

export type ValidationState = 'allowed' | 'cyber' | 'blocked';

export interface ValidationResponse {
  state: ValidationState;
  messageId: number;
  message: string;
}

@Injectable()
export class UploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly validationService: ValidationService,
    private readonly messagesService: MessagesService,
  ) {}

  async createSession(): Promise<any> {
    return this.prisma.uploadSession.create({
      data: {},
    });
  }

  async getSession(sessionId: string) {
    return this.prisma.uploadSession.findUniqueOrThrow({
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
    });
  }

  validateExtension(extension: string) {
    const result = this.validationService.validateExtension(extension);

    const message = this.messagesService.getMessage(result.messageId);

    return {
      state: result.state,
      messageId: result.messageId,
      message: message?.message ?? 'Unknown message',
    };
  }

  async uploadFile(
    sessionId: string,
    file: Express.Multer.File,
    relativePath: string,
  ): Promise<any> {
    await this.prisma.uploadSession.findUniqueOrThrow({
      where: {
        id: sessionId,
      },
    });

    const extension = path.extname(file.originalname).toLowerCase();

    const validation = this.validationService.validateExtension(extension);

    const message = this.messagesService.getMessage(validation.messageId);

    const storedPath = await this.storageService.saveFile(
      sessionId,
      relativePath,
      file.buffer,
    );

    return this.prisma.fileRecord.create({
      data: {
        sessionId,

        originalName: file.originalname,

        relativePath,

        extension,

        storedPath,

        validationState: validation.state,

        validationMessage: message?.message ?? 'Unknown message',
      },
    });
  }
}
