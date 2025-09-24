import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Music, musicData, Planet, planetsData } from '../constants/shopData';
import { updateUser } from '../store/slices/authSlice';
import Sound from 'react-native-sound';
import { colors } from '../constants/colors';

Sound.setCategory('Playback');

export default function ShopScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const purchasedItems = user?.purchases ? user?.purchases : [];
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // music preview states
  const [currentSound, setCurrentSound] = useState<Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const stars = user?.stars ? user.stars : 0;

  const handlePurchase = async (item: Planet | Music) => {
    if (stars < item.price) {
      Alert.alert(
        'Not enough stars!',
        'You need more stars to purchase this item',
      );
      return;
    }
    dispatch(
      updateUser({
        userId: user?.id ? user.id : '',
        data: {
          purchases: [...(user?.purchases ?? []), item.id],
          stars: stars - item.price,
        },
      }),
    );
    setModalVisible(true);
  };

  const isPurchased = (id: string) => purchasedItems.includes(id);

// preview music 
const handlePreview = (item: Music) => {
    if (playingId === item.id) {
      currentSound?.stop(() => {
        setCurrentSound(null);
        setPlayingId(null);
      });
    } else {
      if (currentSound) {
        currentSound.stop(() => {
          currentSound.release(); 
        });
      }
      const sound = new Sound(item.file, Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.log('failed to load sound', error);
          return;
        }
        
        sound.play(success => {
          if (!success) {
            console.log('playback failed');
          }
          setCurrentSound(null);
          setPlayingId(null);
        });
      });

      setCurrentSound(sound);
      setPlayingId(item.id);
    }
  };

  const renderPlanet = (item: Planet) => {
    const purchased = isPurchased(item.id);
    return (
      <View style={styles.itemContainer} key={`planet-${item.id}`}>
        <Image source={item.asset} style={styles.planetImage} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
          <View style={styles.purchaseContainer}>
            <Text style={styles.price}>{item.price} <Ionicons name='star' size={16} color={colors.star} /></Text>
            <TouchableOpacity
              style={[styles.purchaseButton, purchased && styles.purchasedButton]}
              onPress={() => handlePurchase(item)}
              disabled={purchased}
            >
              <Text style={styles.purchaseButtonText}>
                {purchased ? 'Purchased' : 'Purchase'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderMusic = (item: Music) => {
    const purchased = isPurchased(item.id);
    const isPlaying = playingId === item.id;

   return (
    <View style={styles.itemContainer} key={`music-${item.id}`}>
      <Image source={item.image} style={styles.musicImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <View style={styles.purchaseContainer}>
          <Text style={styles.price}>{item.price} <Ionicons name='star' size={16} color={colors.star} /></Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={[styles.previewButton, isPlaying && styles.previewButtonActive]}
              onPress={() => handlePreview(item)}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={20}
                color={colors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.purchaseButton, purchased && styles.purchasedButton]}
              onPress={() => handlePurchase(item)}
              disabled={purchased}
            >
              <Text style={styles.purchaseButtonText}>
                {purchased ? 'Purchased' : 'Purchase'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Universe Shop</Text>
        <View style={styles.starsContainer}>
          <Ionicons name="star" size={24} color={colors.star} />
          <Text style={styles.starsText}>{stars}</Text>
        </View>
      </View>

      {/* scroll */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} />}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planets</Text>
          {planetsData.map(renderPlanet)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Music</Text>
          {musicData.map(renderMusic)}
        </View>
      </ScrollView>

      {/* modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons
              name="checkmark-circle"
              size={60}
              color={colors.light.success}
              style={styles.checkIcon}
            />
            <Text style={styles.modalTitle}>Congratulations!</Text>
            <Text style={styles.modalMessage}>
              You've successfully purchased a new item!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Great!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: colors.light.card,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.light.text,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  starsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
    marginLeft: 6,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.light.text,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: colors.light.card,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planetImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  musicImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginTop: 5,
  },
  purchaseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.star,
  },
  purchaseButton: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  purchasedButton: {
    backgroundColor: colors.light.border,
  },
  purchaseButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewButton: {
    backgroundColor: colors.light.border,
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewButtonActive: {
    backgroundColor: colors.light.accent,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.light.card,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
  },
  checkIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

