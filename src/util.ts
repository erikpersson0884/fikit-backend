import path from "path"
import fs from "fs"


const dataFolderPath = "data/";
export const pathToCommiteeFile = dataFolderPath + "commitee.json";

export const pathToProfileImages = "public/images/profileImages";
export const pathToPostImages = "public/images/postImages/";

export const pathToPostsFile = dataFolderPath + "posts.json";
export const pathToPatetosFile = dataFolderPath + "patetos.json";
export const pathToCredentialsFile = dataFolderPath + "credentials.json";
export const pathToAdminkeysFile = dataFolderPath + "adminKeys.json";

export const adminKeysLifeTime = 10 * 24 * 60 * 60 * 1000; // 10 days in milliseconds


export function createRandomSuffix() {
	return Date.now() + '-' + Math.round(Math.random() * 1E9)
}

export function readFileToJson(path: string) {
    const data = fs.readFileSync(path);
    return JSON.parse(data.toString());
}