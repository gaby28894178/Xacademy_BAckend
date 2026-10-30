import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlayersService } from './players.service';
import { CreatePlayerDto, UpdatePlayerDto, PlayerQueryDto } from './dto/player.dto';

@ApiTags('Players')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('players')
export class PlayersController {
  constructor(private playersService: PlayersService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of players with filters' })
  @ApiResponse({ status: 200, description: 'Paginated player list' })
  findAll(@Query() query: PlayerQueryDto) {
    return this.playersService.findAll(query);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export filtered players as Excel/CSV' })
  @ApiResponse({ status: 200, description: 'Excel file download' })
  async exportCsv(@Query() query: PlayerQueryDto, @Res() res: Response) {
    const buffer = await this.playersService.exportCsv(query);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="players.xlsx"',
    );
    res.end(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get player details by ID' })
  @ApiResponse({ status: 200, description: 'Player details with all stats' })
  @ApiResponse({ status: 404, description: 'Player not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.findOne(id);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get player skill evolution timeline (2015–2023)' })
  @ApiResponse({ status: 200, description: 'Player timeline data' })
  getTimeline(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.getTimeline(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new player' })
  @ApiResponse({ status: 201, description: 'Player created' })
  create(@Body() dto: CreatePlayerDto) {
    return this.playersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update player info and skills' })
  @ApiResponse({ status: 200, description: 'Player updated' })
  @ApiResponse({ status: 404, description: 'Player not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlayerDto,
  ) {
    return this.playersService.update(id, dto);
  }

  @Post('import/csv')
  @ApiOperation({ summary: 'Import players from CSV/Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  importCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    return this.playersService.importCsv(file.buffer);
  }
}
