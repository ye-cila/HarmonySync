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

  // Overlaps
  const maxLength = Math.max(artistsA.length, artistsB.length);
  const overlapScore = sharedArtists.length / maxLength;

  // Similar in rank
  let rankingSimilarity = 0;

  sharedArtists.forEach((artist) => {
    const name = artist.name.toLowerCase();

    const rankA = rankMapA.get(name);
    const rankB = rankMapB.get(name);

    const rankDifference = Math.abs(rankA - rankB);

    const artistSimilarity =
      1 - rankDifference / (maxLength - 1 || 1);

    rankingSimilarity += artistSimilarity;
  });

  rankingSimilarity /= sharedArtists.length;

  // Combine overlap and ranking similarity
  const score = Math.round(
    overlapScore * rankingSimilarity * 100
  );

  return {
    sharedArtists,
    sharedCount: sharedArtists.length,
    score,
  };
};

export const createHarmonyPlaylist = (
  tracksA,
  tracksB,
  artistsA,
  artistsB
) => {
  // Create maps so we can quickly find each user's artist ranking
  const rankMapA = new Map();
  const rankMapB = new Map();

  artistsA.forEach((artist, index) => {
    rankMapA.set(artist.name.toLowerCase(), index + 1);
  });

  artistsB.forEach((artist, index) => {
    rankMapB.set(artist.name.toLowerCase(), index + 1);
  });

  // Keep track of songs each user has listened to
  const tracksASet = new Set(tracksA.map((track) => track.id));
  const tracksBSet = new Set(tracksB.map((track) => track.id));

  // Combine both users' tracks
  const allTracks = [...tracksA, ...tracksB];

  // Use a Map to remove duplicate tracks
  const trackMap = new Map();

  allTracks.forEach((track) => {
    const artistName = track.artists[0].name.toLowerCase();

    const rankA = rankMapA.get(artistName);
    const rankB = rankMapB.get(artistName);

    let score = 0;

    // Higher-ranked artists get more points
    if (rankA) {
      score += artistsA.length - rankA + 1;
    }

    if (rankB) {
      score += artistsB.length - rankB + 1;
    }

    // Bonus if BOTH users have listened to this exact song
    if (tracksASet.has(track.id) && tracksBSet.has(track.id)) {
      score += 5;
    }

    trackMap.set(track.id, {
      track,
      score,
    });
  });

  // Convert Map to array and sort highest score first
  return [...trackMap.values()]
    .sort((a, b) => b.score - a.score)
    .map((item) => ({
      ...item.track,
      harmonyScore: item.score,
    }));
};