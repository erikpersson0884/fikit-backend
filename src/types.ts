
export interface Group {
    id: string;
    name: string;
    year: number;
    people: Person[];
}

export interface Person {    
    id: string;
    name: string;
    nickname: string;
    post: string;
    description: string;
    url: string;
    imageFileName: string;
}

export interface Post {
    id: string;
    title: string;
    description: string;
    creationDate: Date;
    imageFileName: string;
}

export interface AdminKey {
    key: string;
    username: string;
    date: string;
}

export interface Committee {
    name: string;
    logoImageName: string;
    established: string;
    fallbackImageName: string;
    
    socialMedia?: Media[];
    email?: string;
    phone?: string; 
}

export interface Media {
    name: string;
    url: string;
    logoImageName: string;
}

export interface RecipeT {
    name: string;
    ingredients: Ingredient[];
}

export interface Ingredient {
    name: string;
    weight: number;
    unit: string;
    density: number;
    packageSize: number | typeof NaN;
}

export interface Instruction {
    step:number;
    description: string;
}