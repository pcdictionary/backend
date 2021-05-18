/**
 * @jest-environment node
 */

import { seedData } from "./seedDataDumps/seedData100.js";
import hashPassword from "../../utils/hashPassword.js";
import { locationStore } from "../../index.js";
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const GAMETYPES = ["HANDBALL", "BASKETBALL", "SOCCER", "TENNIS", "PINGPONG"];
const PARKS = [
  "Seth Low Playground",
  "Dahill Triangle",
  "Gravesend Park",
  "Friends Field",
  "Milestone Park",
  "Parks",
  "Bealin Square",
  "Samuel Goldberg Triangle",
  "Lt. Joseph Petrosino Playground",
  "Ketchum Triangle",
  "Boro Park Village",
  "Boro Park Village Phase",
  "Garibaldi Playground",
];
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
  for (let i = 0; i < 2000; i++) {
    try {
      let user = await client.eloHistory.create({
        data: {
          eloId: getRndInteger(1, 99),
          eloHistory: getRndInteger(100, 1500),
          GameType: GAMETYPES[getRndInteger(0, 5)],
        },
      });
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
          GameType: GAMETYPES[getRndInteger(0, 5)],
          createdAt: new Date(),
        },
      });
      for (let x = 0; x < arr.length; x++) {
        await client.user.update({
          where: {
            id: arr[x],
          },
          data: {
            allGames: {
              connect: {
                id: game.id,
              },
            },
          },
        });
      }
    } catch (error) {
      console.log("Seed Category Error on entry:\n");
      console.log(seedData.categoryList[i], source, "index: ", i);
      console.log(error);
      process.exit(1);
    }
  }

  try {
    for (let x = 0; x < 50; x++) {
      const park = PARKS[getRndInteger(0, 12)];
      const userId = getRndInteger(1, 5);
      const sport = GAMETYPES[getRndInteger(0, 5)];
      const value = await locationStore.get(park);
      if (value == undefined) {
        // handle miss!
        console.log("value doesnt exist");
        await locationStore.set(park, { [userId]: sport, count: 1 }, 3600);
      } else {
        console.log("value exists");
        value[userId] = sport;
        value.count = value.count + 1;
        await locationStore.set(park, value, 3600);
      }

      const test = await locationStore.set(userId, park, 3600);
    }
  } catch (error) {
    console.log("Seed Category Error on entry:\n");
    console.log(seedData.categoryList[i], source, "index: ", i);
    console.log(error);
    process.exit(1);
  }

  if (test) return [validUserIds.length];
}
