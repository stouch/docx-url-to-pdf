import { Express } from "express";
import actuator from "express-actuator";
import bodyParser from "body-parser";

export const apply_middleware: (server: Express) => void = (server) => {
	server.use(bodyParser.json());
	server.use(bodyParser.urlencoded({ extended: true }));
	server.use(actuator());
}