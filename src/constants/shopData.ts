import { ImageSourcePropType } from 'react-native';
export type Planet = {
  id: string;
  name: string;
  description: string;
  price: number;
  asset: ImageSourcePropType;
};

export type Music = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: ImageSourcePropType;
  file: string; 
};

export const planetsData: Planet[] = [
  {
    id: 'P1',
    name: 'Planet 1',
    description: 'A mysterious small planet orbiting quietly.',
    price: 50,
    asset: require('../assets/images/planet1.png'),
  },
  {
    id: 'P2',
    name: 'Planet 2',
    description: 'A medium-sized world with calm landscapes.',
    price: 75,
    asset: require('../assets/images/planet2.png'),
  },
  {
    id: 'P3',
    name: 'Planet 3',
    description: 'A giant planet with endless horizons.',
    price: 100,
    asset: require('../assets/images/planet3.png'),
  },
  {
    id: 'P4',
    name: 'Planet 4',
    description: 'A lush planet full of strange wonders.',
    price: 120,
    asset: require('../assets/images/planet4.png'),
  },
];


export const musicData: Music[] = [
  {
    id: 'M1',
    name: 'White Noise',
    description: 'Soothing white noise for focus or sleep',
    price: 30,
    image: require('../assets/images/music.png'),
    file: 'whitenoise.mp3',
  },
  {
    id: 'M2',
    name: 'Flutter Rain',
    description: 'Gentle rain with soft flutters',
    price: 40,
    image: require('../assets/images/music.png'),
    file: 'fluterain.mp3',
  },
  {
    id: 'M3',
    name: 'Rain',
    description: 'Relaxing rain sounds',
    price: 35,
    image: require('../assets/images/music.png'),
    file: 'rain.mp3',
  },
  {
    id: 'M4',
    name: 'Cafe Noise',
    description: 'Ambient café sounds for concentration',
    price: 50,
    image: require('../assets/images/music.png'),
    file: 'cafenoise.mp3',
  },
];
