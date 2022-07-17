import { __prod__ } from "../constants";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Todo } from "../entities/Todo";

export const appDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: "vstodo",
  entities: [User, Todo],
  synchronize: !__prod__,
  logging: !__prod__,
});
