import gql from "graphql-tag";

const typeDefs = gql`
    type Game {
        status: VerificationStatus
        GameType: GameType
        score1: Int
        score2: Int
    }
`;

export default typeDefs;
