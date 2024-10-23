import { Router } from 'express';
import fs from 'fs';

import { pathToCommiteeFile } from '../util';
import { CommitteeInfo } from '../types';
import { uploadCommiteeImage } from './imgHandler';
import { isAdminKeyValid } from './AuthRouter';

const commiteeRouter = Router();

export function getCommitteeInfo(): CommitteeInfo {
    const data = fs.readFileSync(pathToCommiteeFile);
    const parsedData: Partial<CommitteeInfo> = JSON.parse(data.toString());

    // Check if parsedData has all attributes of CommitteeInfo
    const requiredAttributes: (keyof CommitteeInfo)[] = ['name', 'establishedYear', 'slogan', 'description', 'logoImageFileName', 'email'];

    let hasMissingAttributes = false;
    for (const attribute of requiredAttributes) {
        if (!(attribute in parsedData)) {
            parsedData[attribute] = '';
            hasMissingAttributes = true;
        }
    }
    if (hasMissingAttributes) setCommitteeInfo(parsedData as CommitteeInfo);

    return parsedData as CommitteeInfo;
}

export function setCommitteeInfo(commiteeInfo: CommitteeInfo) {
    const dataToWrite = JSON.stringify(commiteeInfo, null, 2);
    fs.writeFileSync(pathToCommiteeFile, dataToWrite);
}

commiteeRouter.get('/', (req, res) => {
    const commiteeInfo = getCommitteeInfo();
    res.status(200).send(commiteeInfo);
});

commiteeRouter.put('/', (req, res) => {
    uploadCommiteeImage(req, res, async function (err) {
        if (!req.body.adminKey) return res.status(403).send("Adminkey not provided");
        if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");    
        
        if (!req.body.commiteeInfo) return res.status(400).send("No commiteeInfo provided");
    
        const oldCommiteeInfo: CommitteeInfo = getCommitteeInfo();

        const providedCommiteeInfo = JSON.parse(req.body.commiteeInfo);

        console.log(req.file);

        const newCommiteInfo: CommitteeInfo = {
            name: providedCommiteeInfo.name || oldCommiteeInfo.name,
            establishedYear: providedCommiteeInfo.establishedYear || oldCommiteeInfo.establishedYear,
            slogan: providedCommiteeInfo.slogan || oldCommiteeInfo.slogan,
            description: providedCommiteeInfo.description || oldCommiteeInfo.description,
            logoImageFileName: req.file ? req.file.filename : oldCommiteeInfo.logoImageFileName,
            email: providedCommiteeInfo.email || oldCommiteeInfo.email,
        }

        console.log("Commitee info updated: ", newCommiteInfo);
        setCommitteeInfo(newCommiteInfo);
        res.status(200).send(newCommiteInfo);
    });
});

export default commiteeRouter;
