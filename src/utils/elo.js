export const probability = (rating1, rating2) => {
  return (
    (1.0 * 1.0) / (1 + 1.0 * Math.pow(10, (1.0 * (rating1 - rating2)) / 400))
  );
};

export const EloRating = (Ra, Rb, K, d) => {
  const Pb = probability(Ra, Rb);

  const Pa = probability(Rb, Ra);

  if (d == 1) {
    Ra = Ra + K * (1 - Pa);
    Rb = Rb + K * (0 - Pb);
  } else {
    Ra = Ra + K * (0 - Pa);
    Rb = Rb + K * (1 - Pb);
  }

  return { Ra: Math.floor(Ra, 6), Rb: Math.floor(Rb, 6) };
};