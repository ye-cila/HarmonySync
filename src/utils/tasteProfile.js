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

const normalizeSongName = (name) => {
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(
      /\s*-\s*(remaster(ed)?|live|acoustic|radio edit|remix|version|mix).*$/i,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
};

export const createHarmonyPlaylist = (
  tracksA,
  tracksB,
  artistsA,
  artistsB,
  candidateTracks
) => {
  const rankMapA = new Map();
  const rankMapB = new Map();

  artistsA.forEach((artist, index) => {
    rankMapA.set(artist.name.toLowerCase(), index + 1);
  });

  artistsB.forEach((artist, index) => {
    rankMapB.set(artist.name.toLowerCase(), index + 1);
  });

  // Songs the users have already seen
  const existingTrackIds = new Set([
    ...tracksA.map((track) => track.id),
    ...tracksB.map((track) => track.id),
  ]);

  const trackMap = new Map();
  const seenSongs = new Set();

  candidateTracks.forEach((track) => {
    // Don't recommend songs already in either user's Top 20
    if (existingTrackIds.has(track.id)) {
      return;
    }

    const songKey =
      track.external_ids?.isrc ||
      `${normalizeSongName(track.name)}-${track.artists[0]?.name
        ?.toLowerCase()
        .trim()}`;

    if (seenSongs.has(songKey)) {
      return;
    }

    seenSongs.add(songKey);

    const artistName =
      track.artists?.[0]?.name?.toLowerCase();

    if (!artistName) {
      return;
    }

    const rankA = rankMapA.get(artistName);
    const rankB = rankMapB.get(artistName);

    let score = 0;

    // Stronger points for artists both users rank highly
    if (rankA) {
      score += artistsA.length - rankA + 1;
    }

    if (rankB) {
      score += artistsB.length - rankB + 1;
    }

    // Extra bonus if the artist is highly ranked by BOTH users
    if (rankA && rankB) {
      score += 10;
    }

    trackMap.set(songKey, {
      track,
      score,
    });
  });

  return [...trackMap.values()]
    .sort((a, b) => b.score - a.score)
    .map((item) => ({
      ...item.track,
      harmonyScore: item.score,
    }));
};

export const createTasteProfile = (tracks, artists) => {
  if (tracks.length === 0) {
    return {
      averageDuration: 0,
      averagePopularity: 0,
      averageReleaseYear: 0,
      topArtists: [],
    };
  }

  // Average song duration
  const totalDuration = tracks.reduce(
    (sum, track) => sum + track.duration_ms,
    0
  );

  const averageDuration = Math.round(
    totalDuration / tracks.length
  );

  // Average Spotify popularity
  const totalPopularity = tracks.reduce(
    (sum, track) => sum + (track.popularity || 0),
    0
  );

  const averagePopularity = Math.round(
    totalPopularity / tracks.length
  );

  // Average release year
  const releaseYears = tracks
    .map((track) => {
      const date = track.album?.release_date;

      if (!date) return null;

      return parseInt(date.substring(0, 4));
    })
    .filter((year) => !isNaN(year));

  const averageReleaseYear =
    releaseYears.length > 0
      ? Math.round(
          releaseYears.reduce((sum, year) => sum + year, 0) /
            releaseYears.length
        )
      : 0;

  // Keep artist ranking information
  const topArtists = artists.map((artist, index) => ({
    name: artist.name,
    rank: index + 1,
  }));

  return {
    averageDuration,
    averagePopularity,
    averageReleaseYear,
    topArtists,
  };
};