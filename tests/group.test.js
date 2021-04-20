const request = require("supertest");
const app = require("../src/app");
const Group = require("../src/models/group");
const { setupDatabase, userTwo } = require("./db");

beforeEach(setupDatabase);
describe("Groups Testing", () => {
  test("Should create a group with given name ", async () => {
    //   Send the create group request
    const response = await request(app)
      .post("/groups/create")
      .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
      .send({
        name: "Group1",
      })
      .expect(200);

    //Assertions about the response
    expect(response.body).toMatchObject({
      name: "Group1",
    });
  });
});
