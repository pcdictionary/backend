import gql from "graphql-tag";

const typeDefs = gql`
    type Elo {
        Handball   Int
        Basketball Int
        Soccer     Int
        Tennis     Int
        PingPong   Int
    }
`;

export default typeDefs;
