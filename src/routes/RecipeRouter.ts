import router from 'express';
import fs from 'fs';
import { isAdminKeyValid } from './AuthRouter';

const RecipeRouter = router();

import {pathToRecipesFile, createRandomSuffix} from '../util';
import { Recipe } from '../types';
import { get } from 'http';

function getRecipes() {
    const recipes = fs.readFileSync(pathToRecipesFile);
    return JSON.parse(recipes.toString());
}

RecipeRouter.get('/getAllRecipes', (req, res) => {
    res.send(getRecipes());
});

RecipeRouter.post('/addRecipe', (req, res) => {
    if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

    const newRecipe: Recipe = {
        id: createRandomSuffix(),
        name: req.body.name || 'New Recipe',
        author: req.body.author || null,
        instructions: req.body.instructions || '',
        ingredients: req.body.ingredients || [],
    }
    const recipes = getRecipes();

    recipes.push(newRecipe);
    fs.writeFileSync('recipes.json', JSON.stringify(recipes));
    res.status(200).send(newRecipe);
});

RecipeRouter.post('/updateRecipe', (req, res) => {
    if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

    const recipes = getRecipes();
    const oldRecipe = recipes.find((r: any) => r.id === req.body.recipe.id);

    const newRecipe = {
        id: oldRecipe.id,
        name: req.body.recipe.name || oldRecipe.name,
        author : req.body.recipe.author || oldRecipe.author,
        instructions: req.body.recipe.instructions || oldRecipe.instructions,
        ingredients: req.body.recipe.ingredients || oldRecipe.ingredients,
    }

    const newRecipes = recipes.map((r: any) => r.id === newRecipe.id ? newRecipe : r);
    
    fs.writeFileSync('recipes.json', JSON.stringify(newRecipes));
    res.status(200).send(newRecipe);
});

RecipeRouter.post('/deleteRecipe', (req, res) => {
    if (!isAdminKeyValid(req.body.adminKey)) return res.status(403).send("Adminkey not valid");

    const recipeId = req.body.recipeId;
    const recipes = getRecipes();

    const newRecipes = recipes.filter((recipe: any) => recipe.id !== recipeId);
    fs.writeFileSync('recipes.json', JSON.stringify(newRecipes));
    res.status(200).send(`Recipe with id ${recipeId} was deleted`);
});

export default RecipeRouter;
