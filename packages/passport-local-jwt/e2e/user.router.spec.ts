import request from 'supertest';
import app from '../src/app';

describe('Integration Tests - Local Strategy', () => {
  test('Should login user and return token', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'john.doe@example.com', password: 'change_me' });

    const expectedBody = {
      email: 'john.doe@example.com',
      userId: '1234_john_doe_user_id',
      username: 'John Doe',
    };
    expect(response.body).toMatchObject(expectedBody);
    expect(response.body.token).toBeDefined();
    expect(response.status).toEqual(200);
  });

  test('Should login user and return token', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'fake@example.com', password: 'change_me' });

    expect(response.status).toEqual(401);
    expect(response.text).toEqual('Email or password is not correct');
  });
});
