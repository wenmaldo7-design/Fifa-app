import { Sequelize } from 'sequelize-typescript';

import { Player } from '../players/player.model';

export const sequelize = new Sequelize({
  dialect: 'mysql',

  host: 'localhost',
  port: 3307,

  username: 'root',
  password: 'root',

  database: 'fifa_db',

  models: [Player],
});