import { Injectable, NotFoundException } from '@nestjs/common';
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
    const session = await this.prisma.uploadSession.findUnique({
      where: { id: sessionId },
      include: {
        files: {
          orderBy: { relativePath: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    return session;
  }

  private resolveValidation(extension: string) {
    const validation = this.validationService.validateExtension(extension);
    const message = this.messagesService.getMessage(validation.messageId);

    return {
      ...validation,
      message: message?.message ?? 'Unknown message',
    };
  }

  validateExtension(extension: string) {
    return this.resolveValidation(extension);
  }

  async uploadFile(
    sessionId: string,
    file: Express.Multer.File,
    relativePath: string,
  ) {
    const session = await this.prisma.uploadSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    const extension = path.extname(file.originalname).toLowerCase();

    const validation = this.resolveValidation(extension);

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

        validationMessage: validation.message ?? 'Unknown message',
      },
    });
  }
}
