import router from 'express';
import fs from 'fs';
import { isAdminKeyValid } from './AuthRouter';

const RecipeRouter = router();

import {pathToRecipesFile} from '../util';


RecipeRouter.get('/getAllRecipes', (req, res) => {
    let recipes = fs.readFileSync(pathToRecipesFile, 'utf-8');
    res.send(recipes);
});

RecipeRouter.post('/addRecipe', (req, res) => {
    if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

    const recipe = req.body;
    const recipes = JSON.parse(fs.readFileSync(pathToRecipesFile, 'utf-8'));
    recipes.push(recipe);
    fs.writeFileSync('recipes.json', JSON.stringify(recipes));
    res.status(200).send('Recipe added');
});

RecipeRouter.post('/updateRecipe', (req, res) => {
    if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

    const recipe = req.body;
    const recipes = JSON.parse(fs.readFileSync(pathToRecipesFile, 'utf-8'));
    const newRecipes = recipes.map((r: any) => r.id === recipe.id ? recipe : r);
    fs.writeFileSync('recipes.json', JSON.stringify(newRecipes));
    res.status(200).send('Recipe updated');
});

RecipeRouter.post('/deleteRecipe', (req, res) => {
    if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

    const recipeId = req.body.recipeId;
    const recipes = JSON.parse(fs.readFileSync('recipes.json', 'utf-8'));
    const newRecipes = recipes.filter((recipe: any) => recipe.id !== recipeId);
    fs.writeFileSync('recipes.json', JSON.stringify(newRecipes));
    res.status(200).send('Recipe deleted');
});



export default RecipeRouter;