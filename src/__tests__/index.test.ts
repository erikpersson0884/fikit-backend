import request from 'supertest';
import app from '../index';

describe('GET /', () => {
  it('should return "Hello, TypeScript with Node.js!"', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hello, TypeScript with Node.js!');
  });
});
