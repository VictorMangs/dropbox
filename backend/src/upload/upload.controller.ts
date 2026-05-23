import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'

import { FileInterceptor } from '@nestjs/platform-express'

import { UploadService } from './upload.service'


@Controller()
export class UploadController {
  constructor(
    private uploadService: UploadService,
  ) {}

  @Post('upload-sessions')
  async createSession() {
    return this.uploadService.createSession()
  }

  @Get('upload-sessions/:id')
    async getSession(
    @Param('id') sessionId: string,
    ) {
    return this.uploadService.getSession(
        sessionId,
    )
    }

  @Post('upload-sessions/:id/files')
  @UseInterceptors(
    FileInterceptor('file'),
  )
  async uploadFile(
    @Param('id') sessionId: string,

    @UploadedFile()
    file: Express.Multer.File,

    @Body('relativePath')
    relativePath: string,
    ) {
    if (!file) {
        throw new BadRequestException(
        'No file uploaded. Ensure multipart/form-data is correct.',
        )
    }

    return this.uploadService.uploadFile(
        sessionId,
        file,
        relativePath,
    )
    }
}