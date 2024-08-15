import { Router } from 'express';
import fs from 'fs';

import { pathToCommiteeFile } from '../util';


const commiteeRouter = Router();

export function getCommitteeInfo() {
    const data = fs.readFileSync(pathToCommiteeFile);
    return JSON.parse(data.toString());
}

commiteeRouter.get('/getCommitteeInfo', (req, res) => {
    const commiteeInfo = getCommitteeInfo();
    res.status(200).send(commiteeInfo);
});




export default commiteeRouter;