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

  return {
    sharedArtists,
    sharedCount: sharedArtists.length,
  };
};