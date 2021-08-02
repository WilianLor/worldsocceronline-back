const Coach = require("../models/Coaches");
const President = require("../models/Presidents");
const User = require("../models/Users");
const Team = require("../models/Teams");
import { Request, Response } from "express";
const jwt = require("jsonwebtoken");
import jwt_decode from "jwt-decode";

interface data {
  id: string;
}

interface interest {
  _id: string;
  teamId: string;
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
      if (await Coach.findOne({ username: user.username })) {
        return res.status(400).send({ error: "You are already registered" });
      }

      await User.findOne({ username: user.username }).update({
        profession: "Coach",
      });

      const coachData = {
        username: user.username,
        userId: id,
        countryId: user.countryId,
        cash: 0,
      };

      const coach = await Coach.create(coachData);

      const data = {
        token: generateToken({ id: coach.userId, profession: "Coach", passwordVersion: user.passwordVersion }),
        profession: "Coach",
        user: {
          userId: user._id,
          professionId: coach._id,
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
      const coach = await Coach.findOne({ userId: id });

      if (!coach) {
        return res.status(400).send({ error: "President not found" });
      }

      if (description.length > 200) {
        return res
          .status(400)
          .send({ error: "Limite de caracteres excedido." });
      }

      coach.description = description;

      await coach.save();

      return res.status(200).send({ message: "Descrição atualizada." });
    } catch (err) {
      return res.status(400).send({ error: "Erro: " + err });
    }
  },

  async getCoaches(req: Request, res: Response) {
    const { coachName, onlyInterested, countryId } = req.params;

    const { authorization } = req.headers;

    const tokenSplited = authorization.split(" ");

    const token = tokenSplited[1];

    const data: data = jwt_decode(token);

    const { id } = data;

    try {
      let coaches = [];

      const president = await President.findOne({ userId: id });

      if (!president || !president.teamId) {
        return res.status(400).send({ error: "User not found." });
      }

      if (countryId != "null") {
        coaches = await Coach.find({ countryId: countryId }).populate([
          "countryId",
          "teamId",
        ]);
      } else {
        coaches = await Coach.find({}).populate(["countryId", "teamId"]);
      }

      let filtredCoaches = [];

      if (onlyInterested != "false") {
        coaches.map((coach) => {
          coach.interestTeams.map((interest: interest) => {
            if (
              JSON.stringify(interest.teamId) ===
              JSON.stringify(president.teamId)
            ) {
              filtredCoaches.push(coach);
            }
          });
        });
      } else {
        filtredCoaches = coaches;
      }

      let finalCoaches = [];

      if (coachName != "null") {
        filtredCoaches.map((coach) => {
          if (
            coach.username.toLowerCase().indexOf(coachName.toLowerCase()) >= 0
          ) {
            finalCoaches.push(coach);
          }
        });
      } else {
        finalCoaches = filtredCoaches;
      }

      const data = [];

      finalCoaches.map((coach) => {
        let teamImage;

        if (coach.teamId) {
          teamImage = coach.teamId.pictureUrl;
        } else {
          teamImage = "";
        }

        data.push({
          _id: coach._id,
          username: coach.username,
          countryImage: coach.countryId.pictureUrl,
          teamImage: teamImage,
        });
      });

      return res.status(200).send(data);
    } catch (err) {
      return res.status(400).send({ error: "Operation failed" + err });
    }
  },

  async getCoach(req: Request, res: Response) {
    const { authorization } = req.headers;
    const { coachId } = req.params;

    const tokenSplited = authorization.split(" ");

    const token = tokenSplited[1];

    const data: data = jwt_decode(token);

    const { id } = data;

    try {
      const user = await User.findOne({ _id: id });

      if (!user) {
        return res.status(400).send({ error: "User not found." });
      }

      const coach = await Coach.findOne({ _id: coachId }).populate([
        "countryId",
        "activeContract.teamId",
        "career.teamId",
      ]);

      if (!coach) {
        return res.status(400).send({ error: "Coach not found." });
      }

      const coachData = {
        _id: coach._id,
        userId: coach.userId,
        username: coach.username,
        description: coach.description,
        countryImage: coach.countryId.pictureUrl,
        cash: coach.cash,
        activeContract: coach.activeContract
          ? coach.activeContract
          : {
              teamId: {
                _id: "",
                name: "",
                pictureUrl: "",
              },
              initialDate: "",
              salary: 0,
              seasonsDuration: 0,
              terminationFine: 0,
            },
        career: coach.career,
      };

      return res.status(200).send(coachData);
    } catch (err) {
      return res.status(400).send({ error: "Operation failed" + err });
    }
  },

  async showInterest(req: Request, res: Response) {
    const { teamId } = req.body;

    const { authorization } = req.headers;

    const tokenSplited = authorization.split(" ");

    const token = tokenSplited[1];

    const data: data = jwt_decode(token);

    const { id } = data;

    try {
      const coach = await Coach.findOne({ userId: id });

      const team = await Team.findOne({ _id: teamId });

      if (!coach) {
        return res.status(400).send({ error: "Coach not found" });
      }

      if (!team) {
        return res.status(400).send({ error: "Team not found" });
      }

      if (coach.teamId === teamId) {
        return res.status(400).send({ error: "Coach already in this team" });
      }

      let alreadyShowInterest = 0;

      coach.interestTeams.map((interest) => {
        if (interest.teamId === team._id) {
          alreadyShowInterest = alreadyShowInterest + 1;
        }
      });

      if (alreadyShowInterest > 0) {
        return res
          .status(400)
          .send({ error: "Coach already show interest in this team" });
      }

      coach.interestTeams.push({ teamId });
      team.interestedCoaches.push({ coachId: coach._id });

      await coach.save();
      await team.save();

      return res.status(200).send(coach.interestTeams);
    } catch (err) {
      return res.status(400).send({ error: "Error: " + err });
    }
  },

  async removeInterest(req: Request, res: Response) {
    const { teamId } = req.body;

    const { authorization } = req.headers;

    const tokenSplited = authorization.split(" ");

    const token = tokenSplited[1];

    const data: data = jwt_decode(token);

    const { id } = data;

    try {
      const coach = await Coach.findOne({ userId: id });

      const team = await Team.findOne({ _id: teamId });

      if (!coach) {
        return res.status(400).send({ error: "Coach not found" });
      }

      if (!team) {
        return res.status(400).send({ error: "Team not found" });
      }

      let interestIndex;
      let interestIndex2;

      coach.interestTeams.map((interest, index) => {
        if (interest.teamId == teamId) {
          interestIndex = index;
        }
      });

      team.interestedCoaches.map((interest, index) => {
        if (interest.coachId == coach._id) {
          interestIndex2 = index;
        }
      });

      let removed;

      if (interestIndex >= 0) {
        removed = coach.interestTeams.splice(interestIndex, 1);
        team.interestedCoaches.splice(interestIndex2, 1);
      } else {
        return res
          .status(400)
          .send({ error: "Coach has not interest in this team" });
      }

      await coach.save();
      await team.save();

      return res.status(200).send({ message: "Interest removed: " + removed });
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
      const coach = await Coach.findOne({ userId: id });

      if (!coach) {
        return res.status(400).send({ error: "Coach id is invalid" });
      }

      if (coach.teamId === undefined) {
        return res.status(400).send({ error: "This coach dont have a team" });
      }

      const team = await Team.findOne({ _id: coach.teamId });

      if (!team) {
        return res.status(400).send({ error: "Team id is invalid" });
      }

      if (coach.activeContract.terminationFine) {
        if (coach.activeContract.terminationFine > coach.cash) {
          return res
            .status(400)
            .send({
              error: "You dont have money to pay your termination fine.",
            });
        }

        coach.cash = coach.cash - coach.activeContract.terminationFine;

        team.funds.total =
          team.funds.total + coach.activeContract.terminationFine;

        team.funds.movements.push({
          description:
            "The coach paid the termination fine and ends the contract with his team",
          value: coach.activeContract.terminationFine,
          type: true,
          date: new Date(),
          coachId: coach._id,
        });
      }

      team.coachId = undefined;

      coach.teamId = undefined;

      const date = new Date();

      const career = {
        teamId: coach.activeContract.teamId,
        initialDate: coach.activeContract.initialDate,
        finalDate: date,
      };

      coach.career.push(career);

      coach.activeContract = undefined;

      await coach.save();
      await team.save();

      return res.status(200).send({ message: "Coach leave of the team" });
    } catch (err) {
      return res.status(400).send({ error: "Error: " + err });
    }
  },
};
