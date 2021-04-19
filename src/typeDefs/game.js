import gql from "graphql-tag";

const typeDefs = gql`
    type Game {
        status: VerificationStatus
        GameType: GameType
        score1: Int
        score2: Int
        users1: [User]
        users2: [User]
    }
`;

export default typeDefs;
