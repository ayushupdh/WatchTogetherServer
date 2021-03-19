const request = require("supertest");
const app = require("../src/app");
const Group = require("../src/models/group");
const {
  setupDatabase,
  userOne,
  userOneId,
  userTwo,
  userTwoId,
} = require("./db");

beforeEach(setupDatabase);
describe("Groups Testing", () => {
  test("Should create a group with given name and current_session_time", async () => {
    //   Send the create group request
    const response = await request(app)
      .post("/groups/create")
      .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
      .send({
        name: "Group1",
        current_session_time: 0,
      })
      .expect(200);

    //Assertions about the response
    expect(response.body).toMatchObject({
      name: "Group1",
      current_session_time: 0,
    });
  });
});

//  Get group users
// router.get("/groups/users", auth, getGroupUsers);

//  Add users to group
// router.post("/groups/addUser", auth, addUsertogroup);

//  Start a new session in group

//  Add to active users
// router.post("/groups/activeUsers", auth, () => {});

//  Get active users
// router.get("/groups/activeUsers", auth, () => {});

//  Get groups info
// router.get("/groups/:id", auth, getGroupInfo);

//  Get groups info
// router.delete("/groups/:id", auth, deleteGroup);
