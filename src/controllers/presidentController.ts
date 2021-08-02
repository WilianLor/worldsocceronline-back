const President = require("../models/Presidents");
const User = require("../models/Users");
const Team = require("../models/Teams");
import { Request, Response } from "express";
const jwt = require("jsonwebtoken");
import jwt_decode from "jwt-decode";

interface data {
  id: string;
}

const authConfig = require("../config/auth.json");

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
}

export default {
  async create(req: Request, res: Response) {
    const { authorization } = req.headers;

    const tokenSplited = authorization.split(" ");

    const token = tokenSplited[1];

    const data: data = jwt_decode(token);

    const { id } = data;

    const user = await User.findOne({ _id: id });

    try {
      if (await President.findOne({ username: user.username })) {
        return res.status(400).send({ error: "You are already registered" });
      }

      await User.findOne({ username: user.username }).update({
        profession: "President",
      });

      const presidentData = {
        username: user.username,
        userId: id,
        countryId: user.countryId,
      };

      const president = await President.create(presidentData);

      const data = {
        token: generateToken({ id: president.userId, profession: "President", passwordVersion: user.passwordVersion }),
        profession: "President",
        user: {
          userId: user._id,
          professionId: president._id,
          username: user.username,
          country: user.country,
          teamId: "",
          admin: user.admin,
          passwordVersion: user.passwordVersion,
        },
      };

      return res.status(201).send({ data });
    } catch (err) {
      return res.status(400).send({ error: "Operation failed" + err });
    }
  },

  async editDescription(req: Request, res: Response) {
    const { authorization } = req.headers;

    const { description } = req.body;

    const tokenSplited = authorization.split(" ");

    const token = tokenSplited[1];

    const data: data = jwt_decode(token);

    const { id } = data;

    try {
      const president = await President.findOne({ userId: id });

      if (!president) {
        return res.status(400).send({ error: "President not found" });
      }

      if (description.length > 200) {
        return res.status(400).send({ error: "Max caracter limit esxeded." });
      }

      president.description = description;

      await president.save();

      return res.status(200).send({ message: "Descrição atualizada." });
    } catch (err) {
      return res.status(400).send({ error: "Erro: " + err });
    }
  },

  async getPresident(req: Request, res: Response) {
    try {
      const { authorization } = req.headers;

      const tokenSplited = authorization.split(" ");

      const token = tokenSplited[1];

      const data: data = jwt_decode(token);

      const { id } = data;

      const president = await President.findOne({ userId: id });

      return res.status(201).send({ president });
    } catch (err) {
      return res.status(400).send({ error: "Operation failed" + err });
    }
  },

  async getIndex(req: Request, res: Response) {},

  async getAll(req: Request, res: Response) {},

  async joinTeam(req: Request, res: Response) {
    const { authorization } = req.headers;

    const { TeamId } = req.body;

    const tokenSplited = authorization.split(" ");

    const token = tokenSplited[1];

    const data: data = jwt_decode(token);

    const { id } = data;

    try {
      const president = await President.findOne({ userId: id });

      const team = await Team.findOne({ _id: TeamId });

      if (!president) {
        return res.status(400).send({ error: "President not found" });
      }

      if (president.teamId !== undefined) {
        return res
          .status(400)
          .send({ error: "This president already has a team" });
      }

      if (!team) {
        return res.status(400).send({ error: "Team not found" });
      }

      if (team.presidentId !== undefined) {
        return res
          .status(400)
          .send({ error: "This team already has a president" });
      }

      const date = new Date();

      team.presidentId = president._id;

      president.teamId = team._id;
      president.activeMandate = {
        teamId: team._id,
        initialDate: date,
      };

      await team.save();
      await president.save();

      return res.status(201).send({ message: "President has a new team" });
    } catch (err) {
      return res.status(400).send({ error: "Error: " + err });
    }
  },

  async leaveTeam(req: Request, res: Response) {
    const { authorization } = req.headers;

    const tokenSplited = authorization.split(" ");

    const token = tokenSplited[1];

    const data: data = jwt_decode(token);

    const { id } = data;

    try {
      const president = await President.findOne({ userId: id });

      if (!president) {
        return res.status(400).send({ error: "President not found" });
      }

      if (president.teamId === undefined) {
        return res.status(400).send({ error: "This president not has a team" });
      }

      const team = await Team.findOne({ _id: president.teamId });

      if (!team) {
        return res.status(400).send({ error: "Team id is invalid" });
      }

      if (team.presidentId === undefined) {
        return res.status(400).send({ error: "This team not has a president" });
      }

      const { teamId, initialDate } = president.activeMandate;

      president.activeMandate = undefined;

      president.teamId = undefined;

      const date = new Date();

      const careerStage = {
        teamId,
        initialDate,
        finalDate: date,
      };

      president.career.push(careerStage);

      await president.save();

      team.presidentId = undefined;

      await team.save();

      return res
        .status(200)
        .send({ message: "Success, this president no longer has a team" });
    } catch (err) {
      return res.status(400).send({ error: "Error " + err });
    }
  },
};
