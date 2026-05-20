import { Parser } from 'json2csv';

import { Op } from 'sequelize';

import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { Player } from './player.model';

import { CreatePlayerDto } from './dto/create-player.dto';

import { UpdatePlayerDto } from './dto/update-player.dto';

import { SkillEntryDto } from './dto/analyze-timeline.dto';

import { Readable } from 'stream';

import csvParser = require('csv-parser');

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Player)
    private playerModel: typeof Player,
  ) {}

  create(createPlayerDto: CreatePlayerDto) {
    return this.playerModel.create(createPlayerDto as any);
  }

  async findAll(
    page: number,
    limit: number,
    name?: string,
    club?: string,
    position?: string,
  ) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (name && name.trim().length >= 3) {
      const words = name.trim().split(/\s+/).filter((w) => w.length >= 2);
      where[Op.and] = words.map((word) => ({
        short_name: { [Op.like]: `%${word}%` },
      }));
    }

    if (club && club.trim() !== '') {
      where.club_name = { [Op.like]: `%${club}%` }; // cambio aquí
    }

    if (position && position.trim() !== '') {
      where.player_positions = { [Op.like]: `%${position}%` }; // cambio aquí
    }

    return this.playerModel.findAndCountAll({
      where,
      limit,
      offset,
    });
  }

  async findOne(id: number) {
    const player = await this.playerModel.findByPk(id);

    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }

    return player;
  }

  async update(id: number, updatePlayerDto: UpdatePlayerDto) {
    const player = await this.findOne(id);

    return player.update(updatePlayerDto);
  }

  async remove(id: number) {
    const player = await this.findOne(id);

    await player.destroy();

    return {
      message: 'Jugador eliminado',
    };
  }

  async exportCsv(name?: string, club?: string, position?: string) {
    const where: any = {};

    if (name && name.trim() !== '') {
      where.short_name = {
        [Op.like]: `%${name}%`,
      };
    }

    if (club && club.trim() !== '') {
      where.club_name = {
        [Op.like]: `%${club}%`,
      };
    }

    if (position && position.trim() !== '') {
      where.player_positions = {
        [Op.like]: `%${position}%`,
      };
    }

    const players = await this.playerModel.findAll({
      where,
      attributes: ['short_name', 'club_name', 'nationality_name', 'player_positions', 'overall', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic', 'fifa_version'],
      raw: true,
    });

    const json2csv = new Parser();

    return json2csv.parse(players);
  }
  async getTimeline(name: string) {
    return this.playerModel.findAll({
      where: {
        short_name: { [Op.like]: `%${name}%` },
      },
      order: [['fifa_version', 'ASC']], // ordena de 2015 a 2023
    });
  }

  async analyzeTimeline(
    history: SkillEntryDto[],
  ): Promise<{ analysis: string }> {
    const lines = history.map(
      (h) =>
        `FIFA ${h.fifa_version}: overall=${h.overall}, pace=${h.pace}, shooting=${h.shooting}, passing=${h.passing}, dribbling=${h.dribbling}, defending=${h.defending}, physic=${h.physic}`,
    );

    const prompt = `Eres un experto en análisis de jugadores de FIFA. Analiza la evolución de habilidades de un jugador a lo largo de los años y escribe un único párrafo narrativo en español. Destaca mejoras, declives y tendencias importantes. Sé concreto con los números.

Historial:
${lines.join('\n')}

Escribe solo el párrafo, sin títulos ni listas.`;

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API error ${response.status}: ${err}`);
    }

    const data: any = await response.json();
    return { analysis: data.choices[0].message.content.trim() };
  }

  async importCsv(file: Express.Multer.File) {
    const results: any[] = [];

    await new Promise<void>((resolve, reject) => {
      Readable.from(file.buffer)
        .pipe(csvParser())
        .on('data', (data) => {
          results.push({
            short_name: data.short_name,
            club_name: data.club_name,
            nationality_name: data.nationality_name,
            player_positions: data.player_positions,
            overall: Number(data.overall),
            pace: Number(data.pace),
            shooting: Number(data.shooting),
            passing: Number(data.passing),
            dribbling: Number(data.dribbling),
            defending: Number(data.defending),
            physic: Number(data.physic),
            fifa_version: Number(data.fifa_version),
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    await this.playerModel.bulkCreate(results);

    return { message: `${results.length} jugadores importados correctamente` };
  }
}
