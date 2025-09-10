import { Prisma } from '@prisma/client'

import { verifyOtp as _verifyOtp, sendOtp as _sendOtp, get as _get, login as _login, getOne as _getOne, getSearch as _getSearch, create as _create, update as _update, remove as _remove } from '../services/users.service.js';

async function get(req, res, next) {
    try {
        res.json(await _get(req));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error `, err.message);
    }
}

async function login(req, res, next) {
    try {
        res.json(await _login(req));
        console.log(res.statusCode);
    } catch (error) {
        console.error(`Error`, error.message);
    }
}

async function sendOtp(req, res, next) {
    try {
        res.json(await _sendOtp(req));
        console.log(res.statusCode);
    } catch (error) {
        console.error(`Error`, error.message);
    }
}

async function verifyOtp(req, res, next) {
    try {
        res.json(await _verifyOtp(req));
        console.log(res.statusCode);
    } catch (error) {
        console.error(`Error`, error.message);
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

async function getSearch(req, res, next) {
    try {
        res.json(await _getSearch(req));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error`, err.message);
    }
}

async function create(req, res, next) {
    try {
        res.json(await _create(req.body));
        console.log(res.statusCode);
    } catch (error) {
        console.error(`Error`, error.message);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

async function update(req, res, next) {
    try {
        res.json(await _update(req.params.id, req.body));
        console.log(res.statusCode);
    } catch (error) {
        console.error(`Error`, error.message);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

async function remove(req, res, next) {
    try {
        res.json(await _remove(req.params.id));
        console.log(res.statusCode);
    } catch (error) {
        if (error.code === 'P2025') {
            res.statusCode = 200;
            res.json({ statusCode: 1, message: `Record Not Found` })
            console.log(res.statusCode)
        }
        else if (error.code === "P2003") {
            res.statusCode = 200;
            res.json({ statusCode: 1, message: "Child record Exists" })
        }
        console.error(`Error`, error.message);
    }
}

export {
    get,
    login,
    verifyOtp,
    getOne,
    getSearch,
    create,
    update,
    remove,
    sendOtp
};
