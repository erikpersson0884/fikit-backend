import { Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

import {pathToPatetosFile, pathToProfileImages, createRandomSuffix} from '../util';
import { isAdminKeyValid } from './AuthRouter';
import { uploadProfileImage } from './imgHandler';


import { Group, Person } from '../types';


const peopleRouter = Router();

function sortGroups(groups: Group[]) {
	groups.sort((a, b) => b.year - a.year);

	return groups;
}


//  --- ---- MODIFY GROUPS ---- ---

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
	let allGroups: Group[] = getGroups();
	if (allGroups.length === 0) return res.status(404).send("No sittande was found");
	let sittande: Group = allGroups[0];
	res.status(200).send(sittande);
});	

peopleRouter.post('/addGroup', (req, res) => {
	if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");
	
	let allGroups: Group[] = getGroups();
	const newGroup: Group = {
		id: createRandomSuffix(),
		name: req.body.newGroup.name || '',
		year: req.body.newGroup.year || '',
		people: []
	}

	allGroups.push(newGroup);
	sortGroups(allGroups);

	setGroups(allGroups);
	res.status(200).send(newGroup);
});

peopleRouter.post('/deleteGroup', (req, res) => {
	if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

	let allGroups = getGroups();
	const groupId = req.body.groupId;

	const groupIndex = allGroups.findIndex((group: Group) => group.id === groupId);
	if (groupIndex === -1) return res.status(404).send("Group not found");

	allGroups.splice(groupIndex, 1);

	setGroups(allGroups);
	res.status(200).send("group deleted successfully!");
});

peopleRouter.post('/updategroup', (req, res) => {
	if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

	let allGroups = getGroups();

	const updatedGroup: Group = {
		id: req.body.updatedgroup.id,
		name: req.body.updatedgroup.name,
		year: req.body.updatedgroup.year,
		people: req.body.updatedgroup.people,
	}

	let group = allGroups.find((group: Group) => group.id === updatedGroup.id);
	if (!group) return res.status(404).send("group not found");

	Object.assign(group, updatedGroup);
	sortGroups(allGroups);

	setGroups(allGroups);
	res.status(200).send(updatedGroup);
});


//  --- ---- MODIFY USERS ---- ---

peopleRouter.post('/addPerson', (req, res) => {
	if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

	const newPerson: Person = {
		id: createRandomSuffix(),
		name: "",
		nickname: "",
		post: "",
		description: "",
		url: "",
		imageFileName: ""
	}

	const groupId = req.body.groupId;

	let allGroups: Group[] = getGroups();
	
	let group: Group | undefined = allGroups.find((group: Group) => group.id === groupId);
	if (!group) return res.status(404).send(`Group with id ${groupId} was not found`);
	group.people.push(newPerson);

	setGroups(allGroups);
	res.status(200).send(newPerson);
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




export default peopleRouter;