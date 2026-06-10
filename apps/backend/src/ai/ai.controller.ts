import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Kirim pesan ke AI Assistant' })
  async chat(@Body() dto: { message: string; history?: { role: string; parts: { text: string }[] }[] }) {
    const reply = await this.aiService.chat(dto.message, dto.history || []);
    return { reply };
  }
}
