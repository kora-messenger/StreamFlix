export type Title = {
  id: string;
  title: string;
  year: string;
  genre: string;
  poster: any;
};

export const posters = [
  require('../assets/posters/p01.png'),
  require('../assets/posters/p02.png'),
  require('../assets/posters/p03.png'),
  require('../assets/posters/p04.png'),
  require('../assets/posters/p05.png'),
  require('../assets/posters/p06.png'),
  require('../assets/posters/p07.png'),
  require('../assets/posters/p08.png'),
  require('../assets/posters/p09.png'),
  require('../assets/posters/p10.png'),
  require('../assets/posters/p11.png'),
  require('../assets/posters/p12.png'),
];

export const heroBanners = [
  { id: 'h0', title: 'Apollo Has Fallen', meta: 'Action | 2025', image: require('../assets/posters/hero0.png') },
  { id: 'h1', title: 'The Terminal List: Echo', meta: 'Thriller | 2025', image: require('../assets/posters/hero1.png') },
  { id: 'h2', title: 'The Day of the Jackal', meta: 'Crime | 2025', image: require('../assets/posters/hero2.png') },
];

const names = [
  ['Midnight Heist', '2025', 'Thriller'],
  ['Iron Frame', '2024', 'Action'],
  ['Desert Storm', '2024', 'War'],
  ['Ghost Line', '2025', 'Mystery'],
  ['Last Signal', '2023', 'Sci-Fi'],
  ['Red Crown', '2025', 'Drama'],
  ['Silent Edge', '2024', 'Crime'],
  ['Neon Drift', '2025', 'Action'],
  ['Fallout Zone', '2023', 'Adventure'],
  ['Deep Cove', '2024', 'Horror'],
  ['Sand Runner', '2025', 'Adventure'],
  ['Void Pact', '2024', 'Fantasy'],
];

export const titles: Title[] = names.map(([title, year, genre], i) => ({
  id: String(i + 1),
  title,
  year,
  genre,
  poster: posters[i],
}));

export const categories = ['Football', 'Trending', 'Movie', 'Nollywood'];
export const rotatingSearch = ['The Day of the Jackal', 'Fall 2: Deadpoint', 'Midnight Heist', 'Iron Frame'];
export const recentSearches = ['Snowfall', 'fbi'];
export const trendingSearches = [
  'Hope',
  'The Uprising',
  'The Mentalist',
  'By Any Means',
  'Runner',
  'Teen Wolf',
  'Fall 2: Deadpoint',
  'Coven Academy',
  'The Walking Dead',
];
export const searchTabs = ['Movie', 'Series', 'Short TV', 'Music', 'Community'];
export const communities = [
  { id: 'c1', name: 'Movie Lovers Hub', members: '12.4K members', tags: 'Movies | Reviews' },
  { id: 'c2', name: 'Nollywood Nation', members: '8.1K members', tags: 'Nollywood | Chat' },
  { id: 'c3', name: 'Anime Corner', members: '21.9K members', tags: 'Anime | Series' },
];
