const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

const spotifyFetch = async (endpoint, accessToken) => {
  const response = await fetch(`${SPOTIFY_API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.error?.message || `Spotify API error: ${response.status}`
    );
  }

  return response.json();
};

export const getUserProfile = async (accessToken) => {
  return spotifyFetch('/me', accessToken);
};

export const getTopTracks = async (
  accessToken,
  timeRange = 'medium_term',
  limit = 5
) => {
  return spotifyFetch(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    accessToken
  );
};

export const getTopArtists = async (
  accessToken,
  timeRange = 'medium_term',
  limit = 5
) => {
  return spotifyFetch(
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`,
    accessToken
  );
};