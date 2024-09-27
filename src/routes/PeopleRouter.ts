import { Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

import {pathToPatetosFile, pathToProfileImages} from '../util';
import { isAdminKeyValid } from './AuthRouter';
import { uploadProfileImage } from './imgHandler';


import { Group, Person } from '../types';


const peopleRouter = Router();

function getGroups() {
    const data = fs.readFileSync(pathToPatetosFile);
    return JSON.parse(data.toString());
}
function setGroups(groups: Group[]) {
	fs.writeFileSync(pathToPatetosFile, JSON.stringify(groups, null, 2));
}

peopleRouter.get('/getAllGroups', (req, res) => {
	let allGroups: Group[] = getGroups();
	res.status(200).send(allGroups);
});

peopleRouter.get('/getSittande', (req, res) => {
	let allGroups = getGroups();
	if (allGroups.length === 0) return res.status(404).send("No sittande was found");
	let sittande = allGroups[0];
	res.status(200).send(sittande);
});	

peopleRouter.get('/getallGroups', (req, res) => {
	let allGroups = getGroups();
	if (allGroups.length <= 1) return res.status(404).send("No patetos was found");
	allGroups = allGroups.slice(1);
	res.status(200).send(allGroups);
});


//  --- ---- MODIFY USERS ---- ---

peopleRouter.post('/addPerson', (req, res) => {
	if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

	const newPerson = req.body.newPerson;
	const groupId = req.body.groupId;

	let allGroups = getGroups();
	
	let group = allGroups.find((group: Group) => group.id === groupId);
	if (!group) return res.status(404).send(`Group with id ${groupId} was not found`);
	group.people.push(newPerson);

	setGroups(allGroups);
	res.status(200).send(`Person ${newPerson.name} with id ${newPerson.id} was added successfully!`);
});

peopleRouter.post('/deletePerson', (req, res) => {
	if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

	const personId = req.body.personId;
	const groupId = req.body.groupId;

	let allGroups = getGroups();
	
	let group = allGroups.find((group: Group) => group.id === groupId);
	group.people = group.people.filter((person: Person) => person.id !== personId);

	setGroups(allGroups);
	res.status(200).send("Person deleted successfully!");
});

peopleRouter.post('/updatePerson', (req, res) => {	
    uploadProfileImage(req, res, async function (err) {
		if (!req.body.adminKey) return res.status(403).send("Adminkey not provided");
		if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

        if (err instanceof multer.MulterError) {
            return res.status(500).json({ error: err.message });
        } else if (err) {
            return res.status(500).json({ error: 'An unknown error occurred.' });
        }
        const updatedPerson = JSON.parse(req.body.updatedPerson);

		let allGroups = getGroups();
		let group = allGroups.find((group: Group) => group.id === req.body.groupId);
		if (!group) return res.status(404).send(`Group with id ${req.body.groupId} not found`);
		let person = group.people.find((person: Person) => person.id === updatedPerson.id);
		if (!person) return res.status(404).send(`Person with id ${updatedPerson.id} not found`);

        if (req.file) {
            const previousProfilePicture = updatedPerson.imageFile;
            if (previousProfilePicture) {
                const previousImagePath = path.join(pathToProfileImages, previousProfilePicture);
                fs.unlinkSync(previousImagePath);
            }

            updatedPerson.imageFileName = req.file.filename;
		} else {
			updatedPerson.imageFileName = person.imageFileName;
		}		

		Object.assign(person, updatedPerson);
		console.log(updatedPerson);
		setGroups(allGroups);
        return res.status(200).json(updatedPerson);
    });
});




// Manage groups

peopleRouter.post('/addGroup', (req, res) => {
	if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

	let allGroups: Group[] = getGroups();
	const newgroup: Group = req.body.newgroup;

	allGroups.push(newgroup);
	sortGroups(allGroups);

	setGroups(allGroups);
	res.status(200).send("group added successfully!");
});

peopleRouter.post('/deleteGroup', (req, res) => {
	if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

	let allGroups = getGroups();
	const groupId = req.body.groupId;

	allGroups = allGroups.filter((group: Group) => group.id !== groupId);

	setGroups(allGroups);
	res.status(200).send("group deleted successfully!");
});

peopleRouter.post('/updategroup', (req, res) => {
	if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

	let allGroups = getGroups();
	const updatedgroup = req.body.updatedgroup;

	let group = allGroups.find((group: Group) => group.id === updatedgroup.id);
	if (!group) return res.status(404).send("group not found");

	Object.assign(group, updatedgroup);
	sortGroups(allGroups);

	setGroups(allGroups);
	res.status(200).send(updatedgroup);
});



function sortGroups(groups: Group[]) {
	groups.sort((a, b) => b.year - a.year);

	return groups;
}

setGroups(sortGroups(getGroups()));

export default peopleRouter;