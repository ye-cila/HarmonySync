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

const moodKeywords = {
  Chill: [
    'chill',
    'lofi',
    'relax',
    'relaxing',
    'acoustic',
    'ambient',
    'slow',
    'calm',
  ],

  Happy: [
    'happy',
    'fun',
    'good',
    'sunshine',
    'smile',
    'feel good',
    'upbeat',
  ],

  Energetic: [
    'energy',
    'energetic',
    'hype',
    'power',
    'workout',
    'fast',
    'fire',
  ],

  Focus: [
    'focus',
    'instrumental',
    'study',
    'ambient',
    'concentration',
    'piano',
  ],

  Romantic: [
    'love',
    'romantic',
    'heart',
    'kiss',
    'forever',
    'r&b',
  ],

  Melancholy: [
    'sad',
    'lonely',
    'melancholy',
    'cry',
    'tears',
    'miss',
    'heartbreak',
  ],

  Party: [
    'party',
    'dance',
    'club',
    'dj',
    'night',
    'bass',
    'turn up',
  ],

  Study: [
    'study',
    'focus',
    'instrumental',
    'ambient',
    'piano',
    'lofi',
  ],
};

const getMoodScore = (track, mood) => {
  const keywords = moodKeywords[mood];

  if (!keywords) {
    return 0;
  }

  const text = [
    track.name,
    track.album?.name,
    ...(track.artists || []).map(
      (artist) => artist.name
    ),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let score = 0;

  keywords.forEach((keyword) => {
    if (text.includes(keyword.toLowerCase())) {
      score += 1;
    }
  });

  return score;
};

export const createHarmonyPlaylist = (
  roomUsers,
  candidateTracks,
  groupMood
) => {
  // --------------------------------
  // 1. Build an artist-rank map
  //    for EVERY user
  // --------------------------------
  const rankMaps = roomUsers.map((user) => {
    const rankMap = new Map();

    (user.topArtists || []).forEach(
      (artist, index) => {
        rankMap.set(
          artist.name.toLowerCase(),
          index + 1
        );
      }
    );

    return rankMap;
  });

  // --------------------------------
  // 2. Tracks users already know
  //    should not become discoveries
  // --------------------------------
  const existingTrackIds = new Set();

  roomUsers.forEach((user) => {
    (user.topTracks || []).forEach((track) => {
      if (track.id) {
        existingTrackIds.add(track.id);
      }
    });
  });

  // --------------------------------
  // 3. Score every candidate
  // --------------------------------
  const trackMap = new Map();
  const seenSongs = new Set();

  candidateTracks.forEach((track) => {
    if (!track.id) {
      return;
    }

    // Don't recommend a track already in
    // someone's top tracks.
    if (existingTrackIds.has(track.id)) {
      return;
    }

    const artistName =
      track.artists?.[0]?.name
        ?.toLowerCase()
        .trim();

    if (!artistName) {
      return;
    }

    const songKey =
      track.external_ids?.isrc ||
      `${normalizeSongName(track.name)}-${artistName}`;

    if (seenSongs.has(songKey)) {
      return;
    }

    seenSongs.add(songKey);

    // --------------------------------
    // TASTE SCORE
    // --------------------------------
    let tasteScore = 0;

    let usersWhoKnowArtist = 0;

    rankMaps.forEach((rankMap, index) => {
      const rank = rankMap.get(artistName);

      if (rank) {
        const artistCount =
          (roomUsers[index].topArtists || [])
            .length;

        // Higher ranked artist = higher score
        tasteScore +=
          artistCount - rank + 1;

        usersWhoKnowArtist++;
      }
    });

    // Shared artist bonus
    if (usersWhoKnowArtist >= 2) {
      tasteScore +=
        usersWhoKnowArtist * 5;
    }

    // --------------------------------
    // DISCOVERY SCORE
    //
    // A discovered artist can carry
    // information about which known
    // artist led us to them.
    // --------------------------------
    const discoveryScore =
      track.discoveryScore || 0;

    // --------------------------------
    // MOOD SCORE
    // --------------------------------
    let moodScore = 0;

    roomUsers.forEach((user) => {
      const userMood = user.mood;

      if (!userMood) {
        return;
      }

      const userMoodScore =
        getMoodScore(
          track,
          userMood
        );

      // Every user's mood contributes.
      moodScore += userMoodScore;
    });

    // --------------------------------
    // GROUP MOOD BONUS
    // --------------------------------
    if (groupMood) {
      const groupMoodScore =
        getMoodScore(
          track,
          groupMood
        );

      moodScore +=
        groupMoodScore * 2;
    }

    // --------------------------------
    // FINAL SCORE
    // --------------------------------
    //
    // Taste is strongest.
    // Mood is the second major signal.
    // Discovery gives new artists a boost.
    //
    const finalScore =
      tasteScore +
      moodScore * 3 +
      discoveryScore;

    trackMap.set(songKey, {
      track,
      score: finalScore,
      tasteScore,
      moodScore,
      discoveryScore,
    });
  });

  // --------------------------------
  // 4. Sort strongest matches first
  // --------------------------------
  return [...trackMap.values()]
    .sort((a, b) => {
      return b.score - a.score;
    })
    .map((item) => ({
      ...item.track,
      harmonyScore: item.score,
      tasteScore: item.tasteScore,
      moodScore: item.moodScore,
      discoveryScore:
        item.discoveryScore,
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

export const calculateGroupMood = (roomUsers) => {
  const moods = roomUsers
    .map((user) => user.mood)
    .filter(Boolean);

  if (moods.length === 0) {
    return 'Chill';
  }

  const moodCounts = new Map();

  moods.forEach((mood) => {
    moodCounts.set(
      mood,
      (moodCounts.get(mood) || 0) + 1
    );
  });

  const sortedMoods = [...moodCounts.entries()]
    .sort((a, b) => b[1] - a[1]);

  const [topMood, topCount] = sortedMoods[0];

  // Clear majority
  if (topCount > moods.length / 2) {
    return topMood;
  }

  // Different moods → balanced group mood
  const energeticMoods = new Set([
    'Energetic',
    'Party',
  ]);

  const calmMoods = new Set([
    'Chill',
    'Focus',
    'Study',
    'Melancholy',
  ]);

  const hasEnergetic = moods.some((mood) =>
    energeticMoods.has(mood)
  );

  const hasCalm = moods.some((mood) =>
    calmMoods.has(mood)
  );

  if (hasEnergetic && hasCalm) {
    return 'Balanced Energy';
  }

  return 'Mixed Mood';
};