import path from "path"
import fs from "fs"


const dataFolderPath:string = "data/";
export const pathToCommiteeFile: string = dataFolderPath + "commitee.json";

export const pathToProfileImages: string = "public/images/profileImages";
export const pathToPostImages:string = "public/images/postImages/";
export const pathToCommiteeImages: string = "public/images/commiteeImages/";

export const pathToPostsFile: string = dataFolderPath + "posts.json";
export const pathToPatetosFile: string = dataFolderPath + "patetos.json";
export const pathToCredentialsFile: string = dataFolderPath + "credentials.json";
export const pathToAdminkeysFile: string = dataFolderPath + "adminKeys.json";
export const pathToRecipesFile: string = dataFolderPath + "recipes.json";

export const adminKeysLifeTime = 10 * 24 * 60 * 60 * 1000; // 10 days in milliseconds


export function createRandomSuffix() {
	return Date.now() + '-' + Math.round(Math.random() * 1E9)
}

export function readFileToJson(path: string) {
    const data = fs.readFileSync(path);
    return JSON.parse(data.toString());
}

export function initiateDataFiles() {

    [pathToPostsFile, pathToPatetosFile, pathToCredentialsFile, pathToAdminkeysFile].forEach((file: string) => {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, JSON.stringify([]));
        }
    });

    [pathToProfileImages, pathToPostImages, pathToCommiteeImages, dataFolderPath].forEach((folder: string) => {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
    })


}
