import request from 'supertest';
import app from '../src/index';
import { Group } from '../src/types'

describe('GET /', () => {
    it('should return "Hello, TypeScript with Node.js!"', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Hello, TypeScript with Node.js!');
    });
});

describe('GET /api/people/getAllGroups', () => {
    it('should return an array of groups', async () => {
        const response = await request(app).get('/api/people/getAllGroups');
        
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
});