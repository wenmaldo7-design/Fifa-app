import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { AnalyzeTimelineDto } from './dto/analyze-timeline.dto';

@ApiBearerAuth()
@ApiTags('Players')
@UseGuards(AuthGuard('jwt'))
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @ApiOperation({ summary: 'Crear un jugador' })
  @Post()
  create(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playersService.create(createPlayerDto);
  }

  @ApiOperation({ summary: 'Importar jugadores desde un archivo CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    return this.playersService.importCsv(file);
  }

  @ApiOperation({
    summary: 'Listar jugadores paginados con filtros opcionales',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'club', required: false })
  @ApiQuery({ name: 'position', required: false })
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('name') name?: string,
    @Query('club') club?: string,
    @Query('position') position?: string,
  ) {
    return this.playersService.findAll(+page, +limit, name, club, position);
  }

  @ApiOperation({ summary: 'Exportar jugadores filtrados a CSV' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'club', required: false })
  @ApiQuery({ name: 'position', required: false })
  @Get('export/csv')
  async exportCsv(
    @Query('name') name?: string,
    @Query('club') club?: string,
    @Query('position') position?: string,
    @Res() res?,
  ) {
    const csv = await this.playersService.exportCsv(name, club, position);
    res.header('Content-Type', 'text/csv');
    res.attachment('players.csv');
    return res.send(csv);
  }

  @ApiOperation({
    summary: 'Obtener evolución de skills por año para un jugador',
  })
  @ApiQuery({ name: 'name', required: true, example: 'Messi' })
  @Get('timeline/search')
  getTimeline(@Query('name') name: string) {
    return this.playersService.getTimeline(name);
  }

  @ApiOperation({
    summary: 'Analizar evolución de skills con IA (Groq llama3)',
  })
  @Post('timeline/analyze')
  analyzeTimeline(@Body() body: AnalyzeTimelineDto) {
    return this.playersService.analyzeTimeline(body.history);
  }

  @ApiOperation({ summary: 'Obtener un jugador por ID' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.findOne(id);
  }

  @ApiOperation({ summary: 'Editar un jugador por ID' })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    return this.playersService.update(id, updatePlayerDto);
  }

  @ApiOperation({ summary: 'Eliminar un jugador por ID' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.remove(id);
  }
}
