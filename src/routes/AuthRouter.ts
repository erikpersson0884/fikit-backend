import Router from 'express';
import fs from 'fs';
import {pathToCredentialsFile, pathToAdminkeysFile, adminKeysLifeTime} from '../util';
import { AdminKey } from '../types';


const authRouter = Router();


function getCredentials() {
    let credentials = fs.readFileSync(pathToCredentialsFile, 'utf8');
    return JSON.parse(credentials);
}

function getAdminKeys() {
    if (fs.existsSync(pathToAdminkeysFile)) {
        const adminKeys = fs.readFileSync(pathToAdminkeysFile, 'utf8');
        return JSON.parse(adminKeys);
    }
    else {
        throw new Error('Adminkeys file not found');
    }
}

function credentialsIsValid(username:string, password:string) {
    const userCredentials = getCredentials();
    for (const user of userCredentials) {
        if (user.name === username && user.password === password) {
        return true;
        }
    }
    return false;
}

export function getUsernameFromAdminKey(providedAdminKey:string) {
    let adminKeys = getAdminKeys();

    adminKeys.forEach((adminKey: AdminKey) => {
        if (adminKey.key === providedAdminKey){
        return adminKey.username
        }
    });
}

function saveAdminKey(adminKey:string, username:string) {
    const currentDate = new Date().toISOString();
    const newAdminKey: AdminKey = { 
        key: adminKey, 
        username: username, 
        date: currentDate,
    };

    let adminKeys = getAdminKeys();

    adminKeys.push(newAdminKey);

    fs.writeFileSync(pathToAdminkeysFile, JSON.stringify(adminKeys, null, 2));
}

export function isAdminKeyValid(adminKeyData: string) {
    const currentDate = new Date();
    const tenDaysAgo = new Date(currentDate.getTime() - (adminKeysLifeTime));
    const adminKeys = getAdminKeys();

    const foundAdminKey = adminKeys.find((keyData: AdminKey) => keyData.key === adminKeyData);
    if (!foundAdminKey) {
        return false; // Admin key not found
    }

    const savedDate = new Date(foundAdminKey.date); 
    return savedDate >= tenDaysAgo;
}


function removeUnvalidAdminKeys() {
    const currentDate = new Date();
    const tenDaysAgo = new Date(currentDate.getTime() - (adminKeysLifeTime));
    let adminKeys = getAdminKeys();

    adminKeys = adminKeys.filter((keyData: AdminKey) => {
        const savedDate = new Date(keyData.date);
        return savedDate >= tenDaysAgo;
    });

    fs.writeFileSync(pathToAdminkeysFile, JSON.stringify(adminKeys, null, 2));
}

authRouter.post('/login', (req, res) => {
    removeUnvalidAdminKeys();
    const username = req.body.username; 
    const password = req.body.password;
  
    if (credentialsIsValid(username, password)) {
        let adminKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        saveAdminKey(adminKey, username);
        res.status(200).json({ adminKey }); 
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

authRouter.post('/testAdminKey', (req, res) => {
    const adminKey = req.body.adminKey;
    if (isAdminKeyValid(adminKey)) {
        res.status(200).json("Adminkey is valid");
    } else {
        res.status(401).json("Adminkey is not valid");
    }
});

export default authRouter