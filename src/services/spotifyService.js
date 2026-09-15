const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const spotifyFetch = async (
  endpoint,
  accessToken,
  retries = 3
) => {
  const response = await fetch(
    `${SPOTIFY_API_URL}${endpoint}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 429) {
    const retryAfter =
      response.headers.get('Retry-After');

    const waitSeconds = retryAfter
      ? Number(retryAfter)
      : 5;

    if (retries > 0) {
      console.log(
        `Spotify rate limited. Waiting ${waitSeconds} seconds...`
      );

      await sleep(waitSeconds * 1000);

      return spotifyFetch(
        endpoint,
        accessToken,
        retries - 1
      );
    }

    throw new Error(
      'Spotify rate limit reached after multiple retries.'
    );
  }

  if (response.status === 401) {
    const refreshToken = localStorage.getItem(
      'spotify_refresh_token'
    );

    if (refreshToken && retries > 0) {
      const refreshResponse = await fetch(
        'http://127.0.0.1:8888/refresh',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        }
      );

      const refreshData = await refreshResponse.json();

      if (refreshResponse.ok) {
        localStorage.setItem(
          'spotify_token',
          refreshData.access_token
        );

        return spotifyFetch(
          endpoint,
          refreshData.access_token,
          retries - 1
        );
      }
    }
  }

  if (!response.ok) {
    const errorData =
      await response.json().catch(() => ({}));

    throw new Error(
      errorData.error?.message ||
        `Spotify API error: ${response.status}`
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
  limit = 20
) => {
  const data = await spotifyFetch(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    accessToken
  );

  console.log('RAW TRACK:', data.items[0]);

  return data;
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

export const getArtistAlbums = async (
  artistId,
  accessToken,
  limit = 3
) => {
  return spotifyFetch(
    `/artists/${artistId}/albums?include_groups=album,single&limit=${limit}`,
    accessToken
  );
};

export const getAlbumTracks = async (
  albumId,
  accessToken,
  limit = 20
) => {
  return spotifyFetch(
    `/albums/${albumId}/tracks?limit=${limit}`,
    accessToken
  );
}

export const searchSpotify = async (
  query,
  accessToken,
  type = 'track',
  limit = 10
) => {
  return spotifyFetch(
    `/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`,
    accessToken
  );
};

export const refreshAccessToken = async (refreshToken) => {
  const response = await fetch(
    'http://127.0.0.1:8888/refresh',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || 'Could not refresh access token'
    );
  }

  return data;
};