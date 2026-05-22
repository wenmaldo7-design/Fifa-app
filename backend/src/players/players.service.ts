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
    gender?: string,
    nationality?: string,
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
      where.club_name = { [Op.like]: `%${club}%` };
    }

    if (position && position.trim() !== '') {
      where.player_positions = { [Op.like]: `%${position}%` };
    }

    if (nationality && nationality.trim() !== '') {
      where.nationality_name = { [Op.like]: `%${nationality}%` };
    }

    where.gender = gender === 'F' ? 'F' : { [Op.or]: ['M', null] };

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

  async exportCsv(name?: string, club?: string, position?: string, gender?: string, nationality?: string) {
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

    if (nationality && nationality.trim() !== '') {
      where.nationality_name = {
        [Op.like]: `%${nationality}%`,
      };
    }

    where.gender = gender === 'F' ? 'F' : { [Op.or]: ['M', null] };

    const players = await this.playerModel.findAll({
      where,
      attributes: ['short_name', 'club_name', 'nationality_name', 'player_positions', 'overall', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic', 'fifa_version'],
      raw: true,
    });

    const json2csv = new Parser();

    return json2csv.parse(players);
  }
  async getTimeline(name: string, gender?: string) {
    return this.playerModel.findAll({
      where: {
        short_name: { [Op.like]: `%${name}%` },
        gender: gender === 'F' ? 'F' : { [Op.or]: ['M', null] },
      },
      order: [['fifa_version', 'ASC']],
    });
  }

  async analyzeTimeline(
    history: SkillEntryDto[],
    gender = 'M',
  ): Promise<{ analysis: string }> {
    const lines = history.map(
      (h) =>
        `FIFA ${h.fifa_version}: overall=${h.overall}, pace=${h.pace}, shooting=${h.shooting}, passing=${h.passing}, dribbling=${h.dribbling}, defending=${h.defending}, physic=${h.physic}`,
    );

    const isFemale = gender === 'F';

    const prompt = `Eres un experto en análisis de FIFA. Escribe un párrafo narrativo en español sobre la evolución de esta ${isFemale ? 'JUGADORA (género femenino)' : 'jugador (género masculino)'}.
${isFemale ? 'IMPORTANTE: es una mujer. Usa SIEMPRE género femenino: "la jugadora", "ella", "estuvo", "fue considerada", etc. NUNCA uses "el jugador" ni género masculino.' : ''}

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

  async importCsv(file: Express.Multer.File, gender = 'M') {
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
            fifa_update: Number(data.fifa_update) || 0,
            age: Number(data.age) || null,
            gender: data.gender || gender,
            player_face_url: data.player_face_url || '',
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Keep only the latest update per player per FIFA version
    const dedupMap = new Map<string, any>();
    for (const row of results) {
      const key = `${row.short_name}__${row.fifa_version}`;
      const existing = dedupMap.get(key);
      if (!existing || row.fifa_update > existing.fifa_update) {
        dedupMap.set(key, row);
      }
    }
    const deduped = Array.from(dedupMap.values());

    await this.playerModel.bulkCreate(deduped);

    return { message: `${deduped.length} jugadores importados correctamente` };
  }
}
