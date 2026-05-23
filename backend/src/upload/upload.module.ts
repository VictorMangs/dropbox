import { Module } from '@nestjs/common'

import { UploadController } from './upload.controller'

import { UploadService } from './upload.service'
import { ValidationService } from './validation.service'

import { PrismaService } from '../prisma/prisma.service'

import { StorageService } from '../storage/storage.service'

@Module({
  controllers: [UploadController],

  providers: [
    UploadService,
    ValidationService,
    PrismaService,
    StorageService,
  ],
})
export class UploadModule {}