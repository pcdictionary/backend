import gql from "graphql-tag";

const typeDefs = gql`


    type Elo {
        Handball:   Int
        Basketball: Int
        Soccer:     Int
        Tennis:     Int
        Pingpong:   Int
        Americanfootball: Int
        Football: Int
        Baseball: Int
        Volleyball: Int
        Boxing: Int
        Cricket: Int
        Rugby:Int
        Wrestling: Int
        Hockey: Int
        Badminton: Int
        Dodgeball: Int
        Racquetball: Int
        Fencing: Int
        Frisby: Int
        Lacrosse: Int
        Squash: Int
        user:       User
        userId:     Int
        eloHistory: [EloHistory]!
    }
`;

export default typeDefs;
