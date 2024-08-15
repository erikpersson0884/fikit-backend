import express, { Router } from 'express';
import fs from 'fs';
import path from 'path';

import { isAdminKeyValid, getUsernameFromAdminKey } from './AuthRouter';
import { pathToPostsFile, pathToPostImages } from '../util';
import { uploadPost } from './imgHandler'

import { Post } from '../types';


const backRouter = Router();


function getPosts(): Post[] {
	const posts = JSON.parse(fs.readFileSync(pathToPostsFile).toString());
	return posts;
}

function setPosts(posts: Post[]) {
	fs.writeFileSync(pathToPostsFile, JSON.stringify(posts, null, 2));
}


backRouter.get('/getAllPosts', (req, res) => {
	res.status(200).send(getPosts());
});

backRouter.post('/createPost', uploadPost.single('postImage'), (req, res) => {
	if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

	let newPost = req.body.newPost;	
	newPost = JSON.parse(newPost);

	newPost.imageName = path.basename(req.body.file.filename),
	newPost.creationDate = Date.now();
	newPost.createdBy = getUsernameFromAdminKey(req.body.adminKey);

	let posts = getPosts();
	posts.push(newPost);
	setPosts(posts)

	res.status(200).send("Post uploaded successfully!");
});

backRouter.post('/removePost', (req, res) => {
	if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

	let postToRemove = req.body.post;

	let allPosts = getPosts();
	allPosts = allPosts.filter(post => post.id !== postToRemove.id);

	fs.writeFileSync(pathToPostsFile, JSON.stringify(allPosts, null, 2));

	// Remove the corresponding image file
	const imagePath = path.join(pathToPostImages, postToRemove.imageName);
	fs.unlinkSync(imagePath); // This will delete the image file
	
	res.status(200).send("Post removed successfully!");
});


export default backRouter;