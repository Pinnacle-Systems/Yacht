import { prisma } from "../lib/prisma.js";
import { get as _get, create as _create,getOne as _getOne } from '../services/customer.service.js';


async function get(req, res, next) {
  try {
    res.json(await _get(req));
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

async function create(req, res, next) {
    try {
        res.json(await _create(req.body));
    } catch (error) {
        console.error(`Error`, error.message);
        if (error instanceof prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                res.statusCode = 200;
                res.json({ statusCode: 1, message: `${error.meta.target.split("_")[1].toUpperCase()} Already exists` })
                console.log(res.statusCode)
            }
        } else {
            res.json({ statusCode: 1, message: error.message })
        }
    }
}

async function getOne(req, res, next) {
    try {
        res.json(await _getOne(req.params.id));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error`, err.message);
    }
}

export { get, create ,getOne};