import { Body, Controller, Param, ParseIntPipe } from '@nestjs/common';
import { CodeService } from './code.service';
import { Get, Post } from '@nestjs/common';

@Controller({})
export class CodeController {
  constructor(private codeService: CodeService) {}

  @Get('code')
  generateQrCode() {
    return this.codeService.generateQrCode();
  }

  @Get('scan/:id')
  scanQrCode(@Param('id', ParseIntPipe) id: number) {
    return this.codeService.scanQrCode(id);
  }
}
