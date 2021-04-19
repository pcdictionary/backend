/**
 * @jest-environment node
 */

import { seedData } from "./seedDataDumps/seedData100.js";
import hashPassword from "../../utils/hashPassword.js";
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export async function seed(
  client,
  test = false,
  testFailure = false,
  source = "default"
) {
  const validUserIds = [];
  const validOwnerIds = [];
  const validItemIds = [];
  const validCategoryIds = [];

  if (testFailure) {
    try {
      await client.user.create({ data: {} });
    } catch (error) {
      return error;
    }
  }
  let userLength = seedData.userList.length;
  if (test) userLength = 10;
  for (let i = 0; i < userLength; i++) {
    try {
      seedData.userList[i].password = await hashPassword(
        seedData.userList[i].password
      );
      let user = await client.user.create({
        data: { ...seedData.userList[i], elo: { create: {} } },
      });
      validUserIds.push(user.id);
    } catch (error) {
      console.log("Seed User Error on user:\n");
      console.log(seedData.userList[i]);
      console.log(error);
      process.exit(1);
    }
  }
  if (test) userLength = 10;
  for (let i = 0; i < seedData.categoryList.length; i++) {
    try {
      await client.game.create({
        data: {
          users: {
            connect: [
              { id: getRndInteger(1, 99) },
              { id: getRndInteger(1, 99) },
              { id: getRndInteger(1, 99) },
            ],
          },
          users2: {
            connect: [
              { id: getRndInteger(1, 99) },
              { id: getRndInteger(1, 99) },
              { id: getRndInteger(1, 99) },
            ],
          },
        },
      });
    } catch (error) {
      console.log("Seed Category Error on entry:\n");
      console.log(seedData.categoryList[i], source, "index: ", i);
      console.log(error);
      process.exit(1);
    }
  }

  if (test) return [validUserIds.length];
}
