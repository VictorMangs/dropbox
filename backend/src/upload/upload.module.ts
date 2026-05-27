import { Module } from '@nestjs/common';

import { UploadController } from './upload.controller';

import { UploadService } from './upload.service';
import { ValidationService } from './validation.service';

import { PrismaService } from '../prisma/prisma.service';

import { StorageService } from '../storage/storage.service';

import { MessagesService } from '../messages/messages.service';

@Module({
  controllers: [UploadController],

  providers: [
    UploadService,
    ValidationService,
    PrismaService,
    StorageService,
    MessagesService,
  ],
})
export class UploadModule {}
