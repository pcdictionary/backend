export const probability = (rating1, rating2) => {
  return (
    (1.0 * 1.0) / (1 + 1.0 * Math.pow(10, (1.0 * (rating1 - rating2)) / 400))
  );
};

export const EloRating = (Ra, Rb, K = 30, d = 1) => {
  const Pa = probability(Rb, Ra);

  if (d === 1) {
    Ra = Ra + K * (1 - Pa);
  } else if (d === -1) {
    Ra = Ra + K * (0 - Pa);
  } else if (d === 0) {
    return { Ra: Ra };
  }

  return { Ra: Math.floor(Ra, 6) };
};
