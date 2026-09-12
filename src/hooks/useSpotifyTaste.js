import { useEffect, useState } from 'react';

import {
  getUserProfile,
  getTopTracks,
  getTopArtists,
} from '../services/spotifyService';

export const useSpotifyTaste = (accessToken, timeRange) => {
  const [profile, setProfile] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [profileData, tracksData, artistsData] = await Promise.all([
          getUserProfile(accessToken),
          getTopTracks(accessToken, timeRange),
          getTopArtists(accessToken, timeRange),
        ]);

        setProfile(profileData);
        setTracks(tracksData.items);
        setArtists(artistsData.items);
      } catch (error) {
        console.error('Spotify API Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken, timeRange]);

  return {
    profile,
    tracks,
    artists,
    loading,
    error,
  };
};