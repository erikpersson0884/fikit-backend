import express, { Router } from 'express';
import fs from 'fs';
import path from 'path';

import { isAdminKeyValid, getUsernameFromAdminKey } from './AuthRouter';
import { pathToPostsFile, pathToPostImages, createRandomSuffix } from '../util';
import { uploadPostImage } from './imgHandler'

import { Post } from '../types';
import multer from 'multer';


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

backRouter.post('/addPost', (req, res) => {
	uploadPostImage(req, res, async function (err) {
		console.log(req.body.adminKey);
		if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");
		
		if (err instanceof multer.MulterError) {
            return res.status(500).json({ error: err.message });
        } else if (err) {
            return res.status(500).json({ error: 'An unknown error occurred.' });
        }

		let imageFileName: string;
		if (req.file) {
			imageFileName = path.basename(req.file.filename);
		} else {
			return res.status(400).send("No image file was provided");
		}

		let newPost: Post = {
			id: createRandomSuffix(),
			title: req.body.title,
			description: req.body.description,
			imageFileName: imageFileName,
			creationDate: new Date()
		}

		let posts = getPosts();
		posts.push(newPost);
		setPosts(posts)

		res.status(200).send("Post uploaded successfully!");
	});
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

backRouter.post('/updatePost', (req, res) => {
	uploadPostImage(req, res, async function (err) {
		if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

		
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ error: err.message });
        } else if (err) {
            return res.status(500).json({ error: 'An unknown error occurred.' });
        }


		let allPosts = getPosts();
		let post = allPosts.find((post: Post) => post.id === req.body.postId);
		if (!post) return res.status(404).send(`Post with id ${req.body.postId} not found`);

		let updatedPost: Post = {
			id: post.id,
			title: req.body.title,
			description: req.body.description,
			imageFileName: post.imageFileName,
			creationDate: post.creationDate
		}	

        if (req.file) {
            const previousPostPicture = updatedPost.imageFileName;
            if (previousPostPicture) {
                const previousImagePath = path.join(pathToPostImages, previousPostPicture);
                fs.unlinkSync(previousImagePath);
            }

            post.imageFileName = req.file.filename;
		}

		Object.assign(post, updatedPost);
		setPosts(allPosts);
        return res.status(200).json(updatedPost);
	});
});


export default backRouter;