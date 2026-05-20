import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';

@Table
export class Player extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare short_name: string;

  @Column(DataType.STRING)
  declare club_name: string;

  @Column(DataType.STRING)
  declare nationality_name: string;

  @Column(DataType.STRING)
  declare player_positions: string;

  @Column(DataType.INTEGER)
  declare overall: number;

  @Column(DataType.INTEGER)
  declare pace: number;

  @Column(DataType.INTEGER)
  declare shooting: number;

  @Column(DataType.INTEGER)
  declare passing: number;

  @Column(DataType.INTEGER)
  declare dribbling: number;

  @Column(DataType.INTEGER)
  declare defending: number;

  @Column(DataType.INTEGER)
  declare physic: number;

  @Column(DataType.INTEGER)
  declare fifa_version: number;
}