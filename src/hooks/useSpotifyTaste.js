import { useEffect, useState } from 'react';

import {
  getUserProfile,
  getTopTracks,
  getTopArtists,
  getArtistTopTracks,
  getRelatedArtists,
  getAudioFeatures,
} from '../services/spotifyService';

export const useSpotifyTaste = (accessToken, timeRange) => {
  const [profile, setProfile] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [blendCandidates, setBlendCandidates] = useState([]);
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
          getTopTracks(accessToken, timeRange, 50),
          getTopArtists(accessToken, timeRange, 20),
        ]);

        setProfile(profileData);
        const seedArtists = artistsData.items.slice(0, 8);
        const artistTrackResults = await Promise.allSettled(
          seedArtists.map((artist) => getArtistTopTracks(artist.id, accessToken))
        );
        const relatedResults = await Promise.allSettled(
          seedArtists.slice(0, 5).map((artist) => getRelatedArtists(artist.id, accessToken))
        );
        const relatedArtists = relatedResults.flatMap((result) =>
          result.status === 'fulfilled' ? result.value.artists || [] : []
        ).slice(0, 12);
        const relatedTrackResults = await Promise.allSettled(
          relatedArtists.slice(0, 8).map((artist) => getArtistTopTracks(artist.id, accessToken))
        );
        const favoriteArtistTracks = artistTrackResults.flatMap((result, index) =>
          result.status === 'fulfilled'
            ? (result.value.tracks || []).map((track) => ({
              ...track,
              source: 'favorite-artist',
              artistGenres: { [seedArtists[index].name]: seedArtists[index].genres || [] },
            }))
            : []
        );
        const discoveryTracks = relatedTrackResults.flatMap((result, index) =>
          result.status === 'fulfilled'
            ? (result.value.tracks || []).map((track) => ({
              ...track,
              source: 'discovery',
              artistGenres: { [relatedArtists[index].name]: relatedArtists[index].genres || [] },
            }))
            : []
        );
        const candidates = [...favoriteArtistTracks, ...discoveryTracks];
        const allTracks = [...tracksData.items, ...candidates];
        const audioFeaturesResult = await getAudioFeatures(
          [...new Set(allTracks.map((track) => track.id).filter(Boolean))].slice(0, 100),
          accessToken
        ).catch(() => ({ audio_features: [] }));
        const featuresById = new Map((audioFeaturesResult.audio_features || []).filter(Boolean).map((features) => [features.id, features]));
        const enrichedTracks = tracksData.items.map((track) => ({ ...track, audio_features: featuresById.get(track.id) }));
        const enrichedCandidates = candidates.map((track) => ({ ...track, audio_features: featuresById.get(track.id) }));

        setTracks(enrichedTracks);
        setArtists(artistsData.items);
        setBlendCandidates([...new Map(enrichedCandidates.filter((track) => track.id).map((track) => [track.id, track])).values()]);
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
    blendCandidates,
    loading,
    error,
  };
};
