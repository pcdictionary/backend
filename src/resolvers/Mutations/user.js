import bcrypt from "bcryptjs";
import generateAuthToken from "../../utils/generateAuthToken.js";
import hashPassword from "../../utils/hashPassword.js";
import { loginStore, updateUserStore } from "../../index.js";

const user = {
  async createUser(parent, args, { prisma, clientTwilio }, info) {
    try {
      let user;
      const password = await hashPassword(args.data.password);
      await clientTwilio.verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verifications.create({
          to: `+${args.data.phoneNumber}`,
          channel: "sms",
        })
        .then(async (service) => {
          if (service.status === "pending") {
            user = await prisma.user.create({
              data: {
                ...args.data,
                password,
                email: args.data.email.toLowerCase(),
                elo: { create: {} },
              },
              include: {
                elo: true,
              },
            });
          }
        });
      if (!user) {
        throw new Error("Not a real phone number");
      }
      return { user, token: generateAuthToken(user.id) };
    } catch (error) {
      return error;
    }
  },
  async newCode(parent, args, { prisma, clientTwilio, verifiedUserId }, info) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: verifiedUserId,
        },
      });
      clientTwilio.verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verifications.create({
          to: `+${args.phoneNumber}`,
          channel: "sms",
        });
      return user;
    } catch (error) {
      return error;
    }
  },
  async forgotPassword(
    parent,
    args,
    { prisma, clientTwilio, verifiedUserId },
    info
  ) {
    try {
      const updated = await prisma.user.findUnique({
        where: {
          phoneNumber: args.phoneNumber,
        },
      });
      clientTwilio.verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verifications.create({
          to: `+${args.phoneNumber}`,
          channel: "sms",
        })
        .then((verification) => {
          if (verification.status === "pending") {
            updated = true;
          }
        });
      if (updated) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return error;
    }
  },
  async verifyUser(
    parent,
    args,
    { prisma, clientTwilio, verifiedUserId },
    info
  ) {
    try {
      let user = await prisma.user.findUnique({
        where: {
          id: verifiedUserId,
        },
        include: {
          elo: true,
        },
      });
      return clientTwilio.verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verificationChecks.create({
          to: `+${args.phoneNumber}`,
          code: args.code,
        })
        .then(async (verification) => {
          let user = await prisma.user.findUnique({
            where: {
              id: verifiedUserId,
            },
            include: {
              elo: true,
            },
          });

          if (verification.status === "approved") {
            user = await prisma.user.update({
              where: {
                idphoneNumber: {
                  id: verifiedUserId,
                  phoneNumber: user.phoneNumber,
                },
              },
              data: {
                status: "CONFIRMED",
              },
              include: {
                elo: true,
              },
            });
          }
          if (!user) {
            throw new Error("Wrong Number");
          }

          return user;
        });
    } catch (error) {
      return error;
    }
  },
  async login(parent, args, { prisma }, info) {
    try {
      const value = await loginStore.get(args.data.email);
      if (value > 10) {
        throw new Error("Too Many Attempts");
      } else {
        if (value) {
          await loginStore.set(args.data.email, value + 1, 3600);
        } else {
          await loginStore.set(args.data.email, 1, 3600);
        }
      }

      const user = await prisma.user.findUnique({
        where: {
          email: args.data.email,
        },
        include: {
          elo: true,
        },
      });

      if (!user) {
        throw new Error("Unable to login.");
      }
      const isMatch = await bcrypt.compare(args.data.password, user.password);
      if (!isMatch) {
        throw new Error("Unable to login.");
      }

      return {
        user,
        token: generateAuthToken(user.id),
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async allowChanges() {
    try {
      return clientTwilio.verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verificationChecks.create({
          to: `+${args.phoneNumber}`,
          code: args.code,
        })
        .then(async (verification) => {
          let user = await prisma.user.findUnique({
            where: {
              idphoneNumber: {
                id: verifiedUserId,
                phoneNumber: `+${args.phoneNumber}`,
              },
            },
            include: {
              elo: true,
            },
          });
          updateUserStore.set(verifiedUserId, true, 1800);
          return user;
        });
    } catch (error) {
      return error;
    }
  },
  async changePhoneNumber(
    parent,
    args,
    { prisma, request, verifiedUserId },
    info
  ) {
    try {
      let updatedUser = await prisma.user.update(
        {
          where: {
            id: verifiedUserId,
          },
          data: { phoneNumber: args.phoneNumber },
          include: {
            elo: true,
          },
        },
        info
      );
      if (!updatedUser) {
        throw new Error("Access Denied");
      }
      return updatedUser;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async updateUser(
    parent,
    args,
    { prisma, request, verifiedUserId, clientTwilio },
    info
  ) {
    try {
      let email;
      if (args.data.email) {
        email = args.data.email.toLowerCase();
      }
      return clientTwilio.verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verificationChecks.create({
          to: `+${args.data.phoneNumber}`,
          code: args.code,
        })
        .then(async (verification) => {
          let updatedUser;
          let newPassword;
          if (verification.status === "approved") {
            if (typeof args.data.password === "string") {
              newPassword = await hashPassword(args.data.password);
            }
            if (newPassword) {
              if (email) {
                updatedUser = await prisma.user.update(
                  {
                    where: {
                      phoneNumber: args.data.phoneNumber,
                    },
                    data: {
                      ...args.data,
                      email: email,
                      password: newPassword,
                    },
                    include: {
                      elo: true,
                    },
                  },
                  info
                );
              } else {
                updatedUser = await prisma.user.update(
                  {
                    where: {
                      phoneNumber: args.data.phoneNumber,
                    },
                    data: {
                      ...args.data,
                      password: newPassword,
                    },
                    include: {
                      elo: true,
                    },
                  },
                  info
                );
              }
            }
            if (!newPassword) {
              if (email) {
                updatedUser = await prisma.user.update(
                  {
                    where: {
                      phoneNumber: args.data.phoneNumber,
                    },
                    data: { ...args.data, email: email },
                    include: {
                      elo: true,
                    },
                  },
                  info
                );
              } else {
                updatedUser = await prisma.user.update(
                  {
                    where: {
                      phoneNumber: args.data.phoneNumber,
                    },
                    data: { ...args.data },
                    include: {
                      elo: true,
                    },
                  },
                  info
                );
              }
            }
          }

          if (!updatedUser) {
            throw new Error("User was not updated");
          }
          return updatedUser;
        });
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async sendCodeForgotEmail(
    parent,
    args,
    { prisma, request, verifiedUserId, clientTwilio },
    info
  ) {
    let success = false;
    await clientTwilio.verify
      .services(process.env.TWILIO_SERVICE_ID)
      .verifications.create({
        to: `+${args.data.phoneNumber}`,
        channel: "sms",
      })
      .then(async (service) => {
        if (service.status === "pending") {
          success = true;
        }
      });
    return success;
  },
  async userEmail(
    parent,
    args,
    { prisma, request, verifiedUserId, clientTwilio },
    info
  ) {
    return clientTwilio.verify
      .services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({
        to: `+${args.phoneNumber}`,
        code: args.code,
      })
      .then(async (verification) => {
        let user;
        if (verification.status === "approved") {
          user = await prisma.user.findUnique({
            where: {
              phoneNumber: args.phoneNumber,
            },
          });
        }
        if (!user) {
          throw new Error("Wrong Number");
        }
        return user;
      });
  },
  async deleteUser(parent, args, { prisma, request, verifiedUserId }, info) {
    try {
      if (verifiedUserId) {
        return new Error("Login in to delete Account!");
      }
      return await prisma.user.delete({ where: { id: verifiedUserId } });
    } catch (error) {
      return error;
    }
  },
};

export default user;
