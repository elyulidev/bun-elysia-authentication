import Elysia from "elysia";
import { databasePlugin } from "./database";

export const app = new Elysia().use(databasePlugin);
