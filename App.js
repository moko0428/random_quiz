import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { ImageList } from './src/data/imageList';
import Margin from './src/components/Margin';

const { width } = Dimensions.get('window');

const getRandomImage = (usedImages) => {
  const availableImages = ImageList.filter(
    (image) => !usedImages.includes(image.id)
  );
  const randomIndex = Math.floor(Math.random() * availableImages.length);
  return availableImages[randomIndex];
};

const App = () => {
  const [usedImages, setUsedImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(getRandomImage(usedImages));
  const [userInput, setUserInput] = useState('');
  const [start, setStart] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [timer, setTimer] = useState(5);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [previousCorrectCount, setPreviousCorrectCount] = useState(0);
  const [maxCorrectCount, setMaxCorrectCount] = useState(0);

  const inputRef = useRef(null);

  useEffect(() => {
    let intervalId;
    if (start && timer > 0 && showImage) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
        setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
      }, 1000);
    } else if (timer === 0) {
      endGame();
    }

    return () => clearInterval(intervalId);
  }, [start, timer, showImage]);

  useEffect(() => {
    if (start && inputRef.current) {
      inputRef.current.focus();
    }
  }, [start]);

  const changeImage = useCallback(() => {
    if (userInput.trim().toLowerCase() === currentImage.answer.toLowerCase()) {
      const newUsedImages = [...usedImages, currentImage.id];
      setUsedImages(newUsedImages);

      if (newUsedImages.length === ImageList.length) {
        endGame();
        return;
      }

      setCurrentImage(getRandomImage(newUsedImages));
      setUserInput('');
      setShowImage(true); // 이미지를 바로 표시
      setTimer(5);
      setCorrectCount((prevCorrectCount) => prevCorrectCount + 1);
      setMaxCorrectCount((prevMaxCorrectCount) =>
        Math.max(prevMaxCorrectCount, correctCount + 1)
      );
      setTimeout(() => {
        setTimer(5);
      }, 1000);
    } else {
      endGame();
    }
  }, [currentImage, userInput, usedImages, correctCount]);

  const gameStartButton = useCallback(() => {
    setUsedImages([]);
    setStart(true);
    setShowImage(true);
    setTimer(5);
    setPreviousCorrectCount(correctCount);
    setCorrectCount(0);
  }, [correctCount]);

  const endGame = useCallback(() => {
    setStart(false);
    setShowImage(false);
    setElapsedTime(0);
    setTimer(5);
    setUserInput('');
    setCurrentImage(getRandomImage(usedImages));
    Alert.alert(
      '게임 종료',
      `이전에 맞춘 갯수: ${previousCorrectCount}\n가장 많이 맞춘 갯수: ${maxCorrectCount}\n총 경과 시간: ${elapsedTime}초\n이번 판 맞춘 갯수: ${correctCount}`
    );
  }, [
    correctCount,
    elapsedTime,
    maxCorrectCount,
    previousCorrectCount,
    usedImages,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>랜덤 인물 맞추기 게임!</Text>
        <Text style={[styles.headerText, { color: 'pink' }]}>400일 축하!</Text>
      </View>

      <View style={styles.imageContainer}>
        {showImage && (
          <Image source={currentImage.image} style={styles.image} />
        )}
      </View>

      <View style={styles.inputContainer}>
        {!start ? (
          <TouchableOpacity
            onPress={gameStartButton}
            style={styles.buttonContainer}
          >
            <Text style={styles.buttonText}>게임 시작</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.timerText}>남은 시간: {timer}초</Text>
            <Margin height={8} />
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="정답을 입력하세요"
            />
            <Margin height={8} />
            <TouchableOpacity onPress={changeImage} style={styles.submitBtn}>
              <Text>정답 입력</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {start && (
        <TouchableOpacity onPress={endGame} style={styles.submitBtn}>
          <Text>게임 종료</Text>
        </TouchableOpacity>
      )}

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>총 경과 시간: {elapsedTime}초</Text>
        <Text style={styles.statsText}>
          이전에 맞춘 갯수: {previousCorrectCount}
        </Text>
        <Text style={styles.statsText}>
          가장 많이 맞춘 갯수: {maxCorrectCount}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 24,
    color: '#333',
  },
  imageContainer: {
    marginVertical: 12,
  },
  image: {
    width: width - 30,
    height: width - 30,
    borderWidth: 1,
    resizeMode: 'contain',
  },
  inputContainer: {
    marginVertical: 8,
  },
  timerText: {
    fontSize: 20,
  },
  buttonContainer: {
    width: width - 30,
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 24,
  },
  input: {
    width: width - 30,
    height: 50,
    borderWidth: 1,
  },
  submitBtn: {
    width: width - 30,
    height: 50,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    marginVertical: 8,
    width: width - 30,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 20,
  },
});

export default App;
