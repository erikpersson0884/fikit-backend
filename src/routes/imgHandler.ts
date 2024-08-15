import fs from 'fs';
import multer from 'multer';
import { pathToPostImages, pathToProfileImages } from '../util';

const postStorage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, pathToPostImages)
	},
	filename: function (req, file, cb) {
		const ogFile = file.originalname.split(".");

	  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + "." + ogFile[ogFile.length-1]
	  cb(null, file.fieldname + '-' + uniqueSuffix)
	}
})

const profileImageStorage = multer.diskStorage({
	destination: function (req, file, cb) {
	  	cb(null, pathToProfileImages)
	},
	filename: function (req, file, cb) {
		const ogFile = file.originalname.split(".");

	  	const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + "." +ogFile[ogFile.length-1]
		cb(null, file.fieldname + '-' + uniqueSuffix)
	}
})


export const uploadPost = multer({ storage: postStorage })
export const uploadProfileImage = multer({ storage: profileImageStorage }).single('personImage');