import type { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import type { IReqUser } from "../middlewares/auth.middleware";
type TRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TLogin = {
  identifier: string;
  password: string;
};

const registerValidateSchema = Yup.object({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string()
    .required()
    .min(6, "Password must be at least 6 characters")
    .test(
      "at-least-one-uppercase-letter",
      "Contains at least one uppercase letter",
      (value) => {
        if (!value) return false;
        const regex = /^(?=.*[A-Z])/;
        return regex.test(value);
      }
    )
    .test("at-least-one-number", "Contains at least one number", (value) => {
      if (!value) return false;
      const regex = /^(?=.*\d)/;
      return regex.test(value);
    }),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password"), ""], "Password must be match"),
});

export default {
  async register(req: Request, res: Response) {
    /**
      #swagger.tags = ['Auth']
     #swagger.requestBody={
      required:true,
      schema:{$ref: '#/components/schemas/RegisterRequest'}
     }
      */
    const { fullName, username, email, password, confirmPassword } =
      req.body as unknown as TRegister;

    try {
      await registerValidateSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });
      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
      });
      res.status(200).json({
        message: "succes registration",
        data: result,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({ message: err.message, data: null });
    }
  },
  async login(req: Request, res: Response) {
    /**
     #swagger.tags = ['Auth']
     #swagger.requestBody = {
     required: true,
     schema: {$ref: "#/components/schemas/LoginRequest"}
     }
     */
    const { identifier, password } = req.body as unknown as TLogin;
    try {
      const userByidentifier = await UserModel.findOne({
        $or: [{ email: identifier }, { username: identifier }],
        isActive: true,
      });
      if (!userByidentifier) {
        return res.status(200).json({ message: "user not found", data: null });
      }

      const validatePassword: boolean =
        encrypt(password) === userByidentifier.password;
      if (!validatePassword) {
        return res
          .status(200)
          .json({ message: "password dont match", data: null });
      }
      const token = generateToken({
        id: userByidentifier._id,
        role: userByidentifier.role,
      });
      res.status(200).json({
        message: "login succes",
        data: token,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({ message: err.message, data: null });
    }
  },
  async me(req: IReqUser, res: Response) {
    /**
      #swagger.tags=['Auth']
     #swagger.security=[{
     "bearerAuth":[]
     }]
     */
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);
      res.status(200).json({
        message: "Success get user profile",
        data: result,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({ message: err.message, data: null });
    }
  },
  async activation(req: Request, res: Response) {
    /**
     #swagger.tags=['Auth']
      #swagger.requestBody={
     required:true,
      schema:{$ref: '#/components/schemas/ActivationRequest'}
     }
     
     */
    try {
      const { code } = req.body as { code: string };
      const user = await UserModel.findOneAndUpdate(
        { activationCode: code },
        {
          isActive: true,
        },
        {
          new: true,
        }
      );

      res
        .status(200)
        .json({ message: "User succesfully activated", data: user });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({ message: err.message, data: null });
    }
  },
};
