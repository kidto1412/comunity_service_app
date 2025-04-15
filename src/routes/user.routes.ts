import { Router, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
const prisma = new PrismaClient();

const router = Router();

router.get("/", async (req: Request, res: any) => {
  res.send("this is user");
});

const diskStorage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, path.join(__dirname, "../../public/images"));
  },
  // konfigurasi penamaan file yang unik
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname),
    );
  },
});

router.post(
  "/upload",
  multer({ storage: diskStorage }).single("photo"),
  async (req: Request, res: Response) => {
    const file = req.body;
    const image = req.file;
    console.log(image);
  },
);

router.post(
  "/register",
  multer({ storage: diskStorage }).single("photo"),
  async (req: Request, res: Response) => {
    const newUser = req.body;
    const image = req.file;
    // const {image} = req.files
    console.log(newUser);
    console.log(image);
    console.log(image, "file");
    try {
      const findUser = await prisma.user.findUnique({
        where: {
          username: newUser.username,
        },
      });
      console.log(findUser, "find user");
      if (findUser != null) {
        res
          .status(409)
          .send({ message: "Username sudah digunakan", data: null });
      } else {
        const hashedPassword = await bcrypt.hash(newUser.password, 10);
        const user = await prisma.user.create({
          data: {
            name: newUser.name,
            date_of_birth: new Date(newUser.date_of_birth),
            username: newUser.username,
            gender: newUser.gender,
            password: hashedPassword,
            photo_profile: req.file ? `images/${req.file.filename}` : null,
          },
        });
        if (user) {
          res.send({ data: "EXECUTE", message: "Success" });
        } else {
          res
            .status(400)
            .send({ data: null, message: "Data inputan tidak sesuai" });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ data: null, message: error });
    }
  },
);

// router.get("/profile", async (req: Request, res: Response) => {
//   const data = req.query;
//   try {
//     const user = await prisma.user.findUnique({
//       where: {
//         username: data.username,
//       },
//     });
//     if (user) {
//       res.send({ data: user, message: "success" });
//     } else {
//       res.status(404).send({ data: null, message: "Pengguna tidak ditemukan" });
//     }
//   } catch (error) {
//     res.status(500).send({ data: null, message: error });
//   }
// });

router.post("/login", async (req: Request, res: Response) => {
  const newUser = req.body;
  try {
    const findUser = await prisma.user.findUnique({
      where: {
        username: newUser.username,
      },
    });
    console.log(findUser);

    if (findUser) {
      const passwordMatch = await bcrypt.compare(
        newUser.password,
        findUser.password,
      );
      if (passwordMatch) {
        const token = jwt.sign({ userId: findUser.id }, "dummySecretKey", {
          expiresIn: "1h",
        });
        res.status(200).send({
          message: "Berhasil",
          data: {
            token: token,
          },
        });
      } else {
        res
          .status(401)
          .send({ message: "Username atau password salah", data: null });
      }
    } else {
      res
        .status(401)
        .send({ message: "Username atau password salah", data: null });
    }
  } catch (error) {
    res.status(500).send({ message: error, data: null });
  }
});

export default router;
