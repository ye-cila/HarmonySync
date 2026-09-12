export const findSharedArtists = (artistsA, artistsB) => {
  const artistNamesA = new Set(
    artistsA.map((artist) => artist.name.toLowerCase())
  );

  return artistsB.filter((artist) =>
    artistNamesA.has(artist.name.toLowerCase())
  );
};

export const createBlend = (artistsA, artistsB) => {
  const sharedArtists = findSharedArtists(artistsA, artistsB);

  if (sharedArtists.length === 0) {
    return {
      sharedArtists: [],
      sharedCount: 0,
      score: 0,
    };
  }

  // Build rank maps
  const rankMapA = new Map();
  const rankMapB = new Map();

  artistsA.forEach((artist, index) => {
    rankMapA.set(artist.name.toLowerCase(), index + 1);
  });

  artistsB.forEach((artist, index) => {
    rankMapB.set(artist.name.toLowerCase(), index + 1);
  });

  const weights = sharedArtists.map((artist) => {
    const name = artist.name.toLowerCase();

    const rankA = rankMapA.get(name);
    const rankB = rankMapB.get(name);

    const weightA = artistsA.length - rankA + 1;
    const weightB = artistsB.length - rankB + 1;

    return (weightA + weightB) / 2;
  });

  const averageWeight =
    weights.reduce((sum, weight) => sum + weight, 0) / weights.length;

  const maxWeight = Math.max(artistsA.length, artistsB.length);

  const score = Math.round((averageWeight / maxWeight) * 100);

  return {
    sharedArtists,
    sharedCount: sharedArtists.length,
    score,
  };
};