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
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ImageList } from './src/data/imageList';
import Margin from './src/components/Margin';
import { mapleFont } from './src/utils/fonts';

const size = 80;
const { width, height } = Dimensions.get('window');

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
  const [startGame, setStartGame] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [timer, setTimer] = useState(5);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [previousCorrectCount, setPreviousCorrectCount] = useState(0);
  const [maxCorrectCount, setMaxCorrectCount] = useState(0);

  const inputRef = useRef(null);

  useEffect(() => {
    let intervalId;
    if (startGame && timer > 0 && showImage) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
        setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
      }, 1000);
    } else if (timer === 0) {
      endGame();
    }

    return () => clearInterval(intervalId);
  }, [startGame, timer, showImage]);

  useEffect(() => {
    if (startGame && inputRef.current) {
      inputRef.current.focus();
    }
  }, [startGame]);

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
      setShowImage(true);
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
    setStartGame(true);
    setShowImage(true);
    setTimer(5);
    setPreviousCorrectCount(correctCount);
    setCorrectCount(0);
  }, [correctCount]);

  const endGame = useCallback(() => {
    setStartGame(false);
    setShowImage(false);
    setElapsedTime(0);
    setTimer(5);
    setUserInput('');
    setCurrentImage(getRandomImage(usedImages));
    Alert.alert(
      '게임 종료',
      `정답은: ${currentImage.answer}!\n이전에 맞춘 갯수: ${previousCorrectCount}\n가장 많이 맞춘 갯수: ${maxCorrectCount}\n총 경과 시간: ${elapsedTime}초\n이번 판 맞춘 갯수: ${correctCount}`
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? height * 0.1 : 0} // iOS에서는 키보드가 나타날 때 화면이 조금 올라가도록 설정
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Margin height={12} />
            <View style={{ alignItems: 'center' }}>
              <Text style={[{ color: 'purple', fontSize: 16 }, mapleFont]}>
                400일 기념 🩷
              </Text>
              <Text style={[styles.headerText, mapleFont]}>
                랜덤 인물 맞추기 게임!
              </Text>
            </View>
            <View style={styles.imageContainer}>
              {showImage && (
                <Image source={currentImage.image} style={styles.image} />
              )}
            </View>

            <View style={[styles.inputContainer]}>
              {!startGame ? (
                <TouchableOpacity
                  onPress={gameStartButton}
                  style={styles.buttonContainer}
                >
                  <Text style={[styles.buttonText, mapleFont]}>게임 시작</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <Text style={[styles.timerText, mapleFont]}>
                    남은 시간: {timer}초
                  </Text>
                  <Margin height={8} />
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={userInput}
                    onChangeText={setUserInput}
                    placeholder="정답을 입력하세요"
                    blurOnSubmit={false} // 키보드가 사라지지 않도록 설정
                    onSubmitEditing={changeImage} // 엔터 키를 눌렀을 때 이미지 변경 함수 호출
                    autoCapitalize="none"
                    autoComplete={false}
                  />
                  <Margin height={8} />
                  <TouchableOpacity
                    onPress={changeImage}
                    style={styles.submitBtn}
                  >
                    <Text style={mapleFont}>정답 입력</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {startGame && (
              <TouchableOpacity onPress={endGame} style={styles.submitBtn}>
                <Text style={mapleFont}>게임 종료</Text>
              </TouchableOpacity>
            )}

            <View style={styles.statsContainer}>
              <Text style={[styles.statsText, mapleFont]}>
                총 경과 시간: {elapsedTime} 초
              </Text>
              <Text style={[styles.statsText, mapleFont]}>
                이전에 맞춘 갯수: {previousCorrectCount} 개
              </Text>
              <Text style={[styles.statsText, mapleFont]}>
                가장 많이 맞춘 갯수: {maxCorrectCount} 개
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFEDFF',
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
    width: width - size,
    height: width - size,
    borderWidth: 1,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  inputContainer: {
    marginVertical: 8,
  },
  timerText: {
    fontSize: 20,
  },
  buttonContainer: {
    width: width - size,
    height: width - size,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  buttonText: {
    fontSize: 24,
  },
  input: {
    width: width - size,
    height: 50,
    borderWidth: 1,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  submitBtn: {
    width: width - size,
    height: 50,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  statsContainer: {
    marginVertical: 8,
    width: width - size,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  statsText: {
    fontSize: 20,
  },
});

export default App;
