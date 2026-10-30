import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Player } from './player.entity';

@Entity('player_stats')
export class PlayerStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  player_id: number;

  @ManyToOne(() => Player, (player) => player.stats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column({ type: 'int' })
  fifa_version: number; // 2015 - 2023

  @Column({ nullable: true })
  pace: number;

  @Column({ nullable: true })
  shooting: number;

  @Column({ nullable: true })
  passing: number;

  @Column({ nullable: true })
  dribbling: number;

  @Column({ nullable: true })
  defending: number;

  @Column({ nullable: true })
  physic: number;

  @Column({ nullable: true })
  skill_moves: number;

  @Column({ nullable: true })
  weak_foot: number;

  @Column({ nullable: true })
  attack: number;

  @Column({ nullable: true })
  vision: number;

  @Column({ nullable: true })
  agility: number;

  @Column({ nullable: true })
  acceleration: number;

  @Column({ nullable: true })
  sprint_speed: number;

  @Column({ nullable: true })
  stamina: number;
}
