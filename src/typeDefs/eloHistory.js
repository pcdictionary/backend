import gql from "graphql-tag";

const typeDefs = gql`
    input GetEloHistoryInput{
        username: String!
        GameType: GameType!
    }
    type EloHistory {
        id: Int
        eloId: Int
        eloHistory: Int
        History: Elo
        GameType: GameType
    }
`;

export default typeDefs;
