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

  @Post('upload-sessions/:id/chunks')
  @UseInterceptors(
    FileInterceptor('chunk'),
  )
  async uploadChunk(
    @Param('id')
    sessionId: string,

    @UploadedFile()
    chunk: Express.Multer.File,

    @Body('chunkIndex')
    chunkIndex: string,

    @Body('totalChunks')
    totalChunks: string,

    @Body('relativePath')
    relativePath: string,

    @Body('fileId')
    fileId: string,
  ) {
    return this.uploadService.uploadChunk(
      {
        sessionId,

        chunk,

        chunkIndex:
          Number(
            chunkIndex,
          ),

        totalChunks:
          Number(
            totalChunks,
          ),

        relativePath,

        fileId,
      },
    )
  }

