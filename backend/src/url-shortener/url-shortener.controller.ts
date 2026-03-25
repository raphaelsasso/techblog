import { Body, Controller, Post } from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';

@Controller('urls')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @Post('shorten')
  shorten(@Body() dto: CreateUrlDto): UrlResponseDto {
    const shortCode = this.urlShortenerService.encode(dto.id);
    return { shortCode, originalUrl: dto.url };
  }
}
