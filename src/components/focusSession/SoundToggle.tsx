import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Sound from 'react-native-sound';
import { colors } from '../../constants/colors';

Sound.setCategory('Playback');

type SoundToggleProps = {
  file: string; 
};

export default function SoundToggle({ file }: SoundToggleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Sound | null>(null);

  const toggleSound = () => {
    if (isPlaying) {
      // stop sound
      sound?.stop(() => {
        setIsPlaying(false);
      });
    } else {
      // if no sound yet, create one
      if (!sound) {
        const newSound = new Sound(file, Sound.MAIN_BUNDLE, error => {
          if (error) {
            console.log('failed to load sound', error);
            return;
          }
          newSound.setNumberOfLoops(-1); // loop forever
          newSound.play(success => {
            if (!success) {
              console.log('playback failed');
            }
          });
          setIsPlaying(true);
        });
        setSound(newSound);
      } else {
        sound.setNumberOfLoops(-1);
        sound.play(success => {
          if (!success) {
            console.log('playback failed');
          }
        });
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (sound) {
        sound.stop();
        sound.release();
      }
    };
  }, [sound]);

  return (
    <TouchableOpacity onPress={toggleSound}>
      <Ionicons
        name={isPlaying ? 'volume-high' : 'volume-mute'}
        size={28}
        color={isPlaying ? colors.light.primary : colors.light.text}
      />
    </TouchableOpacity>
  );
}
