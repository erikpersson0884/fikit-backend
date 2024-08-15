import fs from 'fs';
import multer from 'multer';
import { createRandomSuffix, pathToPostImages, pathToProfileImages, pathToCommiteeImages } from '../util';


function storage(directoryPath: string): multer.StorageEngine {
	return (
		multer.diskStorage({
			destination: function (req, file, cb) {
			  cb(null, directoryPath)
			},
			filename: function (req, file, cb) {
				const ogFile = file.originalname.split(".");
		
			  const uniqueSuffix = createRandomSuffix() + "." + ogFile[ogFile.length-1]
			  cb(null, uniqueSuffix)
			}
		})
	)
}

const postStorage = storage(pathToPostImages);
const profileImageStorage = storage(pathToProfileImages);
const commiteeImageStorage = storage(pathToCommiteeImages);


export const uploadPostImage = multer({ storage: postStorage }).single('postImage');
export const uploadProfileImage = multer({ storage: profileImageStorage }).single('personImage');
export const uploadCommiteeImage = multer({ storage: commiteeImageStorage }).single('commiteeImage');
