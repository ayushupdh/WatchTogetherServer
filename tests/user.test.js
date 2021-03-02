const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/user");

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "Dumbledore",
  email: "dumbledore@hogwarts.com",
  username: "dumbledore",
  password: "Acidpopsand7horcruxes",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};
const userTwoId = new mongoose.Types.ObjectId();

const userTwo = {
  _id: userTwoId,
  name: "Potter",
  email: "potatoter@hogwarts.com",
  username: "potatoter",
  password: "ohno901!",
  friends: [userOneId],
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
  ],
};

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
});

afterAll(() => mongoose.disconnect());

test("Signup a user", async () => {
  const response = await request(app)
    .post("/users/signup")
    .send({
      name: "Bhai",
      email: "bhai1@gmail.com",
      password: "123qwerty",
      username: "bhai",
    })
    .expect(201);

  const user = await User.findById(response.body.user._id);

  // Find the user
  expect(user).not.toBeNull();

  //Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: "Bhai",
      email: "bhai1@gmail.com",
      username: "bhai",
    },
    token: user.tokens[0].token,
  });
});

test("Login a user with username and email", async () => {
  await request(app)
    .post("/users/login")
    .send({
      username: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  await request(app)
    .post("/users/login")
    .send({
      username: userOne.username,
      password: userOne.password,
    })
    .expect(200);
});

test("Login fails with invalid username or email", async () => {
  // Invalid email
  await request(app)
    .post("/users/login")
    .send({
      username: "testuser@gmail.com",
      password: "stupidpassword",
    })
    .expect(400);

  // Invalid username
  await request(app)
    .post("/users/login")
    .send({
      username: "testuser",
      password: "stupidpassword",
    })
    .expect(400);
});

test("Get users profile back", async () => {
  const response = await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body).toMatchObject({
    name: userOne.name,
    email: userOne.email,
    username: userOne.username,
  });
});

test("Don't get profile back for unauthorized user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Add Users Friend", async () => {
  await request(app)
    .patch("/users/me/friend")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      friend: userTwo.username,
    })
    .expect(200);
});

test("Get Users Friend", async () => {
  const response = await request(app)
    .get("/users/me/friend")
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .expect(200);

  expect(response.body).toMatchObject({
    friends: [
      {
        _id: userOneId.toString(),
        name: userOne.name,
        username: userOne.username,
      },
    ],
  });
});

test("Shouldn't add oneself for Friend", async () => {
  await request(app)
    .patch("/users/me/friend")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      friend: userOne.username,
    })
    .expect(404);
});

test("Shouldn't add same user as Friend twice", async () => {
  await request(app)
    .patch("/users/me/friend")
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send({
      friend: userOne.username,
    })
    .expect(404);
});
test("Change user status", async () => {
  await request(app)
    .patch("/users/me/status")
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send({
      status: false,
    })
    .expect(200);
});

test("Delete friend", async () => {
  await request(app)
    .delete("/users/me/friend")
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send({
      friend: userOne.username,
    })
    .expect(200);
});

test("Should not delete friend without authorization", async () => {
  await request(app)
    .delete("/users/me/friend")
    .send({
      friend: userOne.username,
    })
    .expect(401);
});
test("Should not delete friend that doesn't exist", async () => {
  await request(app)
    .delete("/users/me/friend")
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send({
      friend: "randuserthatdoesntexists",
    })
    .expect(404);
});

//----------------------------------- Delete user tests-------------------------------------------

test("Don't delete account for unauthorised user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Delete account for the user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});
