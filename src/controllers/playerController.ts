import { Request, Response } from "express";
const Player = require("../models/Players");
const Team = require("../models/Teams");
const Country = require("../models/Countries");

export default {
  async create(req: Request, res: Response) {
    const {
      firstName,
      lastName,
      position,
      overall,
      age,
      countryId,
      teamId,
      transferAmount,
      baseSalary,
      salary,
      initialDate,
      finalDate,
      terminationFine,
    } = req.body;

    let player = {};

    try {
      if (!(await Country.findOne({ _id: countryId }))) {
        return res.status(400).send({ error: "This country doesn´t exists." });
      }

      if (await Player.findOne({ firstName: firstName, lastName: lastName })) {
        return res.status(400).send({ error: "This player already exists." });
      }

      if (age > 55) {
        return res.status(400).send({ error: "This player is too old." });
      }

      if (position < 0 || position > 13) {
        return res.status(400).send({ error: "Invalid position id." });
      }

      if (overall < 45 || overall > 99) {
        return res.status(400).send({ error: "Invalid overall value." });
      }

      if (transferAmount < 1) {
        return res.status(400).send({ error: "Transfer amount invalid." });
      }

      if (teamId !== "") {
        const team = await Team.findOne({ _id: teamId });

        if (!team) {
          return res.status(400).send({ error: "This team doesn´t exists." });
        }

        if (salary < 1) {
          return res.status(400).send({ error: "Invalid salary amount." });
        }

        if (finalDate < initialDate) {
          return res.status(400).send({ error: "" });
        }

        if (terminationFine !== undefined && terminationFine < 1) {
          return res
            .status(400)
            .send({ error: "Invalid termination fine amount" });
        }

        player = {
          firstName,
          lastName,
          position,
          overall,
          age,
          countryId,
          transferAmount,
          baseSalary,
          teamId,
          activeContract: {
            teamId,
            salary,
            initialDate,
            finalDate,
            terminationFine,
          },
        };

        const createdPlayer = await Player.create(player);

        team.players.push(createdPlayer._id);

        team.funds.total = team.funds.total + salary;

        await team.save();

        return res.status(201).send({ createdPlayer });
      } else {
        player = {
          firstName,
          lastName,
          position,
          overall,
          age,
          countryId,
          transferAmount,
          baseSalary,
        };

        const createdPlayer = await Player.create(player);

        return res.status(201).send({ createdPlayer });
      }
    } catch (err) {
      return res.status(400).send({ error: "Error : " + err });
    }
  },
};
