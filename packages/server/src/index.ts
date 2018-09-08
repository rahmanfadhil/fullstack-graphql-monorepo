import { GraphQLServer } from "graphql-yoga";
import { Prisma, forwardTo } from "prisma-binding";
import { join } from "path";
import { ContextParameters } from "graphql-yoga/dist/types";
import { hashSync, genSaltSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as uniqid from "uniqid";

interface IContext extends ContextParameters {
  db: Prisma;
}

const server = new GraphQLServer({
  resolverValidationOptions: { requireResolversForResolveType: false },
  typeDefs: join(__dirname, "./schema.graphql"),
  resolvers: {
    Query: {
      // Prisma forwarding
      users: forwardTo("db") as any,
      user: forwardTo("db") as any
    },
    Mutation: {
      signup: async (_, { name, email, password }, { db }: IContext) => {
        const checkEmail = await db.query.users({
          where: { email, auth_provider: "EMAIL" }
        });
        if (checkEmail[0]) throw new Error("E-Mail already exist!");
        const hash = hashSync(password, genSaltSync(12));
        const user = await db.mutation.createUser({
          data: {
            name,
            email,
            auth_provider: "EMAIL",
            auth_id: uniqid(uniqid()),
            password: hash
          }
        });
        const token = jwt.sign({ email, id: user.id }, process.env.JWT_SECRET);
        return { user, token };
      },
      login: async (_, { email, password }, { db }: IContext) => {
        const data = await db.query.users({
          where: { email, auth_provider: "EMAIL" }
        });
        const user = data[0];
        if (!user) throw new Error("E-Mail not found!");
        const result = compareSync(password, user.password);
        if (!result) throw new Error("Password invalid!");
        const token = jwt.sign({ email, id: user.id }, process.env.JWT_SECRET);
        return { user, token };
      }
    }
  },
  context: (req) => ({
    ...req,
    db: new Prisma({
      endpoint: process.env.PRISMA_ENDPOINT,
      secret: process.env.PRISMA_SECRET,
      typeDefs: join(__dirname, "./generated/prisma.graphql")
    })
  })
});

server.start(() => console.log("[server] listening ..."));
