import * as fs from 'fs';
import csvParser = require('csv-parser');
import { Player } from '../players/player.model';
import { sequelize } from './sequelize';

async function importFromCsv(filePath: string) {
  const results: any[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => {
        if (!data.short_name) return;
        results.push({
          short_name: data.short_name,
          club_name: data.club_name,
          nationality_name: data.nationality_name,
          player_positions: data.player_positions,
          overall: Number(data.overall) || 0,
          pace: Number(data.pace) || 0,
          shooting: Number(data.shooting) || 0,
          passing: Number(data.passing) || 0,
          dribbling: Number(data.dribbling) || 0,
          defending: Number(data.defending) || 0,
          physic: Number(data.physic) || 0,
          fifa_version: Number(data.fifa_version) || 0,
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  return results;
}

async function importPlayers() {
  await sequelize.authenticate();
  console.log('MYSQL CONECTADO');

  console.log('Importando jugadores masculinos...');
  const malePlayers = await importFromCsv('csv/male_players.csv');
  console.log(`${malePlayers.length} jugadores masculinos listos`);

  console.log('Importando jugadoras femeninas...');
  const femalePlayers = await importFromCsv('csv/female_players.csv');
  console.log(`${femalePlayers.length} jugadoras femeninas listas`);

  const allPlayers = [...malePlayers, ...femalePlayers];

  console.log(`Insertando ${allPlayers.length} registros en la base de datos...`);
  await Player.bulkCreate(allPlayers);

  console.log(`IMPORTADOS: ${allPlayers.length} jugadores en total`);
  process.exit();
}

importPlayers();