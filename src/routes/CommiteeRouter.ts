import { Router } from 'express';
import fs from 'fs';

import { pathToCommiteeFile } from '../util';
import { Committee } from '../types';
import { uploadCommiteeImage } from './imgHandler';

const commiteeRouter = Router();

export function getCommitteeInfo(): Committee {
    const data = fs.readFileSync(pathToCommiteeFile);
    return JSON.parse(data.toString());
}

export function setCommitteeInfo(commiteeInfo: Committee) {
    fs.writeFileSync(pathToCommiteeFile, JSON.stringify(commiteeInfo));
}

commiteeRouter.get('/getCommitteeInfo', (req, res) => {
    const commiteeInfo = getCommitteeInfo();
    res.status(200).send(commiteeInfo);
});

commiteeRouter.post('/setCommitteeInfo', (req, res) => {
    uploadCommiteeImage(req, res, async function (err) {
        const updatedCommiteeInfo = req.body;
        if (updatedCommiteeInfo as Committee === undefined) return res.status(400).send('The provided commite info was unvalid');
        setCommitteeInfo(updatedCommiteeInfo);
        res.status(200).send(updatedCommiteeInfo);

    });
});



export default commiteeRouter;