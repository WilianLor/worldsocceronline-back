const User = require("../models/Users");
const Coach = require("../models/Coaches");
const President = require("../models/Presidents");
import { Request, Response } from "express";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../modules/mailer");
const jwt_decode = require("jwt-decode");

const authConfig = require("../config/auth.json");

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
}

interface data {
  id: string;
}

interface validateData {
  id: string;
  passwordVersion: number;
}

export default {
  async create(req: Request, res: Response) {
    const { email, username } = req.body;

    if (req.body.admin === true) {
      return res.status(200).send({ error: "You is a bad Hacker! kkkkkkk" });
    }

    try {
      if (await User.findOne({ email })) {
        return res.status(200).send({ error: "Email ja está em uso." });
      }

      if (await User.findOne({ username })) {
        return res.status(200).send({ error: "Nome ja está em uso." });
      }

      const user = await User.create(req.body);

      user.password = undefined;

      const data = {
        token: generateToken({
          id: user.id,
          passwordVersion: user.passwordVersion,
        }),
        profession: "",
        user: {
          userId: user._id,
          professionId: "",
          username: user.username,
          countryId: user.countryId,
          teamId: "",
          admin: user.admin,
          passwordVersion: user.passwordVersion,
        },
      };

      return res.status(201).send({ data });
    } catch (err) {
      return res.status(400).send({ error: "Falha! Tente novamente." + err });
    }
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(200).send({ error: "Email não encontrado." });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(200).send({ error: "Senha inválida" });
    }

    let professionId = "";
    let profession = "";
    let teamId = "";

    if (user.profession) {
      if (user.profession === "Coach") {
        const coach = await Coach.findOne({ userId: user._id });

        professionId = coach._id;
        profession = "Coach";

        if (coach.teamId) {
          teamId = coach.teamId;
        }
      } else if (user.profession == "President") {
        const president = await President.findOne({ userId: user._id });

        professionId = president._id;
        profession = "President";

        if (president.teamId) {
          teamId = president.teamId;
        }
      }
    }

    user.password = undefined;

    const data = {
      token: generateToken({
        id: user.id,
        profession: user.profession,
        passwordVersion: user.passwordVersion,
      }),
      profession,
      user: {
        userId: user._id,
        professionId,
        username: user.username,
        countryId: user.countryId,
        teamId,
        admin: user.admin,
        passwordVersion: user.passwordVersion,
      },
    };

    return res.status(200).send({ data });
  },

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(204)
          .send({ error: "Este email não está cadastrado." });
      }

      const token = crypto.randomBytes(20).toString("hex");

      const link = `http://localhost:3000/resetpassword/${user.id}/${token}`;

      const now = new Date();
      now.setHours(now.getHours() + 1);

      await User.findByIdAndUpdate(user.id, {
        $set: {
          passwordResetToken: token,
          passwordResetExpires: now,
        },
      });

      mailer.sendMail(
        {
          from: "wl24player@gmail.com",
          to: email,
          subject: "Alterar senha | World Soccer Online",
          html: `
          <header>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
            <link rel="preconnect" href="https://fonts.gstatic.com">
            <style>
              html {
                font-family: Roboto;
              }
              .mail-container {
                display: flex;
                flex-direction: column;
                width: 100%;
                align-items: center;
                justify-content: center;
                background-color: #1a1a1a;
                padding-bottom: 1rem;
              }
              .image {
                width: 200px;
              }
              .text {
                font-sie: 1rem;
                text-align: center;
                width: 80%;
                margin-top: 1rem;
                color: #E1E1E6;
              }
              .button {
                background-color: #04D361;
                font-weight: 600;
                text-decoration: none;
                padding: 10px;
                color: #E1E1E6;
                font-size: 1.1rem;
                margin-top: 1rem;
                transition: .4s;
                text-align: center;
                border-radius: 4px;
              }
  
              .button:hover {
                background-color: #00ff7f;
              }
            </style>
          </header>
          <body>
            <div class="mail-container">
              <img src="http://localhost:3000/static/media/Logo.bb5716c1.png" class="image"/>
              <h3 class="text">Você esqueceu sua senha? Não tem problema, altere apertando neste botão</h3>
              <a class="button" href="${link}">ALTERAR SENHA</a>
            </div>
          </body>
          `,
        },
        (err) => {
          if (err) {
            return res.status(400).send({ error: "Cannot send email" + err });
          }

          res.status(200).send({ message: "Email sent" });
        }
      );
    } catch (err) {
      res
        .status(400)
        .send({ error: "Error on forgot password, try again" + err });
    }
  },

  async resetPassword(req: Request, res: Response) {
    const { userId, token, password } = req.body;

    try {
      const user = await User.findOne({ _id: userId }).select(
        "+passwordResetToken passwordResetExpires"
      );

      if (!user) {
        return res
          .status(204)
          .send({ error: "Usuário não encontrado." });
      }

      if (token !== user.passwordResetToken) {
        return res
          .status(204)
          .send({ error: "Token inválido." });
      }

      const now = new Date();

      if (now > user.passwordResetExpires) {
        return res
          .status(400)
          .send({ error: "Token expired, generate a new one" });
      }

      user.password = password;

      user.passwordVersion = Math.floor(Math.random() * 1000);

      await user.save();

      return res.status(200).send({ message: "Password has been updated" });
    } catch (err) {
      res.status(400).send({ error: "Cannot reset password, try again" + err });
    }
  },

  async getUser(req: Request, res: Response) {
    const { authorization } = req.headers;

    const tokenSplited = authorization.split(" ");

    const token = tokenSplited[1];

    const data: validateData = jwt_decode(token);

    const { id, passwordVersion } = data;

    const user = await User.findOne({ _id: id });

    try {
      if (!user) {
        return res.status(400).send({ error: "This user id is invalid" });
      }

      if (user.passwordVersion !== passwordVersion) {
        return res.status(205);
      }

      let data = {
        token: generateToken({
          id: user.id,
          profession: user.profession ? user.profession : "",
          passwordVersion: user.passwordVersion,
        }),
        profession: user.profession ? user.profession : "",
        user: {
          userId: user._id,
          professionId: "",
          username: user.username,
          countryId: user.countryId,
          teamId: "",
          admin: user.admin,
          passwordVersion: user.passwordVersion,
        },
      };

      if (user.profession) {
        if (user.profession === "Coach") {
          const coach = await Coach.findOne({ userId: user._id });

          data.user.professionId = coach._id;

          if (coach.teamId) {
            data.user.teamId = coach.teamId;
          }
        } else {
          const president = await President.findOne({ userId: user._id });

          data.user.professionId = president._id;

          if (president.teamId) {
            data.user.teamId = president.teamId;
          }
        }
      }

      return res.status(200).send(data);
    } catch (err) {
      return res.status(400).send({ error: "" });
    }
  },

  async getUserProfile(req: Request, res: Response) {
    const { authorization } = req.headers;
    const { professionId } = req.params;

    const tokenSplited = authorization.split(" ");

    const token = tokenSplited[1];

    const data: data = jwt_decode(token);

    const { id } = data;

    try {
      const user = await User.findOne({ _id: id });

      if (!user) {
        return res.status(400).send({ error: "User not found." });
      }

      let unknownProfession = await Coach.findOne({ _id: professionId });
      let profession = "Coach";

      if (!unknownProfession) {
        unknownProfession = await President.findOne({ _id: professionId });
        profession = "President";
      }

      if (!unknownProfession) {
        return res.status(400).send({ error: "Profession user not founded." });
      }

      if (profession === "Coach") {
        const coach = await Coach.findOne({ _id: professionId }).populate([
          "countryId",
          "activeContract.teamId",
          "career.teamId",
        ]);

        if (!coach) {
          return res.status(400).send({ error: "Coach not found." });
        }

        const coachData = {
          profession,
          userId: coach.userId,
          username: coach.username,
          description: coach.description,
          countryImage: coach.countryId.pictureUrl,
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
                monthsDuration: 0,
                terminationFine: 0,
              },
          career: coach.career,
        };

        return res.status(200).send(coachData);
      } else if (profession === "President") {
        const president = await President.findOne({
          _id: professionId,
        }).populate(["countryId", "activeMandate.teamId", "career.teamId"]);

        if (!president) {
          return res.status(400).send({ error: "President not found." });
        }

        const presidentData = {
          profession,
          userId: president.userId,
          username: president.username,
          description: president.description,
          countryImage: president.countryId.pictureUrl,
          activeContract: president.activeMandate
            ? president.activeMandate
            : {
                teamId: {
                  _id: "",
                  name: "",
                  pictureUrl: "",
                },
                initialDate: "",
              },
          career: president.career,
        };

        return res.status(200).send(presidentData);
      } else {
        return res
          .status(400)
          .send({ error: "This user dont`t have profesison" });
      }
    } catch (err) {
      return res.status(400).send({ error: "Operation failed" + err });
    }
  },
};
