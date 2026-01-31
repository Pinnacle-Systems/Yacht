import { Prisma } from "@prisma/client";
import {
  get as _get,
  getOne as _getOne,
  getSearch as _getSearch,
  create as _create,
  update as _update,
  remove as _remove,
  upload as _upload,
  getStyleCode as _getStyleCode,
} from "../services/style.service.js";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();

async function get(req, res, next) {
  try {
    res.json(await _get(req));
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

async function getOne(req, res, next) {
  try {
    res.json(await _getOne(req.params.id));
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

async function getSearch(req, res, next) {
  try {
    res.json(await _getSearch(req));
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

export async function upload(req, res, next) {
  try {
    res.json(await _upload(req));
  } catch (error) {
    console.error(`Error`, error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.statusCode = 200;
        res.json({
          statusCode: 1,
          message: `${error.meta.target
            .split("_")[1]
            .toUpperCase()} Already exists`,
        });
        console.log(res.statusCode);
      } else {
        res.json({ statusCode: 1, message: "Child Record Exists" });
      }
    } else {
      res.json({
        statusCode: 1,
        message:
          error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message,
      });
    }
  }
}

async function create(req, res, next) {
  try {
    res.json(await _create(req.body));
  } catch (error) {
    console.error(`Error`, error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.statusCode = 200;
        res.json({
          statusCode: 1,
          message: `${error.meta.target
            .split("_")[1]
            .toUpperCase()} Already exists`,
        });
        console.log(res.statusCode);
      }
    } else {
      res.json({ statusCode: 1, message: error.message });
    }
  }
}

async function update(req, res, next) {
  try {
    res.json(await _update(req.params.id, req.body));
  } catch (error) {
    console.error(`Error`, error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.statusCode = 200;
        res.json({
          statusCode: 1,
          message: `${error.meta.target
            .split("_")[1]
            .toUpperCase()} Already exists`,
        });
        console.log(res.statusCode);
      }
    } else {
      res.json({ statusCode: 1, message: error.message });
    }
  }
}

// async function remove(req, res, next) {
//   try {
//     res.json(await _remove(req.params.id));
//     console.log(res.statusCode);
//   } catch (error) {
//     if (error.code === "P2025") {
//       res.statusCode = 200;
//       res.json({ statusCode: 1, message: `Record Not Found` });
//       console.log(res.statusCode);
//     } else if (error.code === "P2003") {
//       res.statusCode = 200;
//       res.json({ statusCode: 1, message: "Child record Exists" });
//     }
//     console.error(`Error`, error.message);
//   }
// }

async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    // 🖼️ Step 1: Find style first to get image filename
    const style = await prisma.style.findUnique({
      where: { id },
    });

    if (style && style.img) {
      const imagePath = path.join(process.cwd(), "uploads", style.img);

      // Delete image if it exists
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`🗑️ Deleted image: ${imagePath}`);
      } else {
        console.warn(`⚠️ Image not found: ${imagePath}`);
      }
    }

    // 🗃️ Step 2: Delete record from DB
    res.json(await _remove(id));
  } catch (error) {
    // 🧩 Handle Prisma errors
    if (error.code === "P2025") {
      res.statusCode = 200;
      res.json({ statusCode: 1, message: "Record Not Found" });
      console.log(res.statusCode);
    } else if (error.code === "P2003") {
      res.statusCode = 200;
      res.json({ statusCode: 1, message: "Child record Exists" });
    } else {
      console.error("Error", error.message);
      res.status(500).json({
        statusCode: 1,
        message: "Error deleting style",
        error,
      });
    }
  }
}

async function getOneStyleCode(req, res, next) {
  try {
    res.json(await _getStyleCode(req));
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

export { get, getOne, getSearch, create, update, remove, getOneStyleCode };
