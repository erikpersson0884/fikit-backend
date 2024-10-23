import fs from "fs"


const dataFolderPath: string = "data/";
export const pathToCommiteeFile: string = dataFolderPath + "commitee.json";

export const pathToProfileImages: string = "public/images/profileImages";
export const pathToPostImages: string = "public/images/postImages/";
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

    ["public", "public/images", dataFolderPath, pathToProfileImages, pathToPostImages, pathToCommiteeImages].forEach((folder: string) => {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
    });

    if (process.env.ADMIN_NAME && process.env.ADMIN_PASSWORD && !fs.existsSync(pathToCredentialsFile)) {
        fs.writeFileSync(pathToCredentialsFile, JSON.stringify([{ name: process.env.ADMIN_NAME, password: process.env.ADMIN_PASSWORD }]));
    }

    [pathToPostsFile, pathToPatetosFile, pathToCredentialsFile, pathToAdminkeysFile].forEach((file: string) => {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, JSON.stringify([]));
        }
    });

}
