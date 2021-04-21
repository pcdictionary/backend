/**
 * @jest-environment node
 */

import { seedData } from "./seedDataDumps/seedData100.js";
import hashPassword from "../../utils/hashPassword.js";
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


const GAMETYPES = ["HANDBALL", "BASKETBALL", "SOCCER", "TENNIS", "PINGPONG"]

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
      let arr = [];
      for (let x = 0; x < 6; x++) {
        arr.push(getRndInteger(1, 99));
      }

      const game = await client.game.create({
        data: {
          users: {
            connect: [{ id: arr[0] }, { id: arr[1] }, { id: arr[2] }],
          },
          users2: {
            connect: [{ id: arr[3] }, { id: arr[4] }, { id: arr[5] }],
          },
          GameType: GAMETYPES[getRndInteger(0,5)]
        },
      });
      for (let x = 0; x < arr.length; x++){
        await client.user.update({
          where:{
            id: arr[x]
          },
          data:{
            allGames:{
              connect: {
                id: game.id
              }
            }
          },

        })
      }

    } catch (error) {
      console.log("Seed Category Error on entry:\n");
      console.log(seedData.categoryList[i], source, "index: ", i);
      console.log(error);
      process.exit(1);
    }
  }

  if (test) return [validUserIds.length];
}
