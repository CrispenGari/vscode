import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { Todo } from "./Todo";

@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  gitHubId: string;

  @Column({ unique: false, nullable: true })
  photoURL?: string;

  @Column({ unique: false, nullable: true })
  bio?: string;

  @OneToMany(() => Todo, (t) => t.creator)
  todos: Todo[];
}
