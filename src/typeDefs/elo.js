import gql from "graphql-tag";

const typeDefs = gql`


    type Elo {
        Handball:   Int
        Basketball: Int
        Soccer:     Int
        Tennis:     Int
        Pingpong:   Int
        user:       User
        userId:     Int
        eloHistory: [EloHistory]!
    }
`;

export default typeDefs;
