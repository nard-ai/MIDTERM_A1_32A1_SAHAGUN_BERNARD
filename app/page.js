"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaStar, FaGem, FaHeart, FaLaptopCode, FaQuestion } from "react-icons/fa";

const spinningMessages = [
  "Spinning... This could be your lucky compile!",
  "Spinning... Will your code execute correctly?",
  "Spinning... Debugging your luck!",
  "Spinning... Optimizing for a win!",
  "Spinning... Crossing fingers for no infinite loop!",
  "Spinning... Are you a computer science genius?",
  "Spinning... Hope you don't hit a bug!",
  "Spinning... Will you make it past the first condition?",
  "Spinning... 3, 2, 1... Success?",
  "Spinning... Can you break the recursion?"
];

const gameOverMessages = [
  "Oops! Looks like your code threw an error. Game Over!",
  "Your algorithm failed... Better luck next time!",
  "Looks like you hit a segmentation fault. Game Over!",
  "Compile error! Try again!",
  "This is the equivalent of a 404... Game Over!",
  "You’ve been debugged... by failure.",
  "Oops! Infinite loop... in the wrong direction. Game Over!",
  "Game Over, but at least you didn't get caught in an endless recursion.",
  "404: Success Not Found. Try again!",
  "Better luck next time, your code ran out of retries!"
];

const symbols = [
  { icon: <FaStar className="text-yellow-400" />, name: 'Star' },
  { icon: <FaGem className="text-blue-400" />, name: 'Gem' },
  { icon: <FaHeart className="text-red-400" />, name: 'Heart' },
  { icon: <FaLaptopCode className="text-green-400" />, name: 'Code' },
  { icon: <FaQuestion className="text-red-400" />, name: 'Question' },
];

const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

const SlotMachine = () => {
  const [reels, setReels] = useState([
    getRandomSymbol(),
    getRandomSymbol(),
    getRandomSymbol(),
  ]);
  const [spinning, setSpinning] = useState(false);
  const [winSound, setWinSound] = useState(null);
  const [spinSound, setSpinSound] = useState(null);
  const [gameOverSound, setGameOverSound] = useState(null);
  const [bgMusic, setBgMusic] = useState(null);
  const [remainingRetries, setRemainingRetries] = useState(3);
  const [statusMessage, setStatusMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isUserNameSet, setIsUserNameSet] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [cooldownEndTime, setCooldownEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const winAudio = new Audio('/win.wav');
    const spinAudio = new Audio('/spin.wav');
    const gameOverAudio = new Audio('/game-over.wav');
    const introAudio = new Audio('/intro.wav');
    introAudio.loop = true;

    setWinSound(winAudio);
    setSpinSound(spinAudio);
    setGameOverSound(gameOverAudio);
    setBgMusic(introAudio);
  }, []);

  useEffect(() => {
    if (bgMusic && !isUserNameSet) {
      const enableAudio = () => {
        bgMusic.play().catch((err) => console.error('Intro audio play error:', err));
        window.removeEventListener('click', enableAudio);
      };
      window.addEventListener('click', enableAudio);
      return () => window.removeEventListener('click', enableAudio);
    }
  }, [bgMusic, isUserNameSet]);

  useEffect(() => {
    if (isUserNameSet) {
      const storedCooldown = localStorage.getItem(`cooldown_${userName}`);
      if (storedCooldown && parseInt(storedCooldown) > Date.now()) {
        setCooldownEndTime(parseInt(storedCooldown));
      }
    }
  }, [isUserNameSet, userName]);

  useEffect(() => {
    if (!cooldownEndTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = cooldownEndTime - now;

      if (diff <= 0) {
        clearInterval(interval);
        setCooldownEndTime(null);
        localStorage.removeItem(`cooldown_${userName}`);
        setRemainingRetries(3);
        setTimeLeft('');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownEndTime, userName]);

  const playWinSound = () => {
    if (winSound) {
      winSound.currentTime = 0;
      winSound.play().catch((err) => console.error('Win sound play error:', err));
    }
  };

  const playSpinSound = () => {
    if (spinSound) {
      spinSound.currentTime = 0;
      spinSound.play().catch((err) => console.error('Spin sound play error:', err));
    }
  };

  const saveGameResult = async (outcome) => {
    try {
      const response = await fetch("http://localhost:5104/save-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentNumber: userName, outcome }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to save game result:", errorText);
      } else {
        console.log("Game result saved.");
      }
    } catch (err) {
      console.error("Error saving game result:", err);
    }
  };

  const spin = () => {
    if (spinning || remainingRetries === 0 || cooldownEndTime) return;

    setSpinning(true);
    setStatusMessage(spinningMessages[Math.floor(Math.random() * spinningMessages.length)]);
    playSpinSound();

    const spinDuration = Math.max(spinSound?.duration || 1, 1) * 800;

    const interval = setInterval(() => {
      setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setSpinning(false);

      let isWin = false;

      if (userName === 'Nin') {
        const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        setReels([winSymbol, winSymbol, winSymbol]);
        isWin = true;
      } else {
        isWin = reels[0]?.name === reels[1]?.name && reels[1]?.name === reels[2]?.name;
      }

      if (isWin) {
        playWinSound();
        setStatusMessage('Congratulations! You win!');
        setHasWon(true);
        saveGameResult("Win");
      } else {
        setRemainingRetries((prev) => {
          const updatedRetries = prev - 1;
          if (updatedRetries === 0) {
            const cooldownTime = Date.now() + 3 * 60 * 60 * 1000;
            localStorage.setItem(`cooldown_${userName}`, cooldownTime);
            setCooldownEndTime(cooldownTime);

            gameOverSound?.play().catch((err) => console.error('Game over sound error:', err));
            setStatusMessage(gameOverMessages[Math.floor(Math.random() * gameOverMessages.length)]);
            saveGameResult("Retries: 0");
          } else {
            setStatusMessage('Try again?');
          }
          return updatedRetries;
        });
      }
    }, spinDuration);
  };

  const handleQuit = () => {
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
    resetGame();
  };

  const handleNewGame = () => {
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
    resetGame();
  };

  const handleNameSubmit = async (event) => {
    event.preventDefault();
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }

    try {
      const validateRes = await fetch(`http://localhost:5104/validate-player?studentNumber=${userName}`);
      if (!validateRes.ok) {
        alert("Invalid student number.");
        return;
      }

      const recentRes = await fetch(`http://localhost:5104/recent-players`);
      const recentPlayers = await recentRes.json();

      if (Array.isArray(recentPlayers) && recentPlayers.includes(userName)) {
        alert("You can only play once every 3 hours. Please try again later.");
        return;
      }

      setIsUserNameSet(true);
    } catch (err) {
      console.error("Validation error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const resetGame = () => {
    setRemainingRetries(3);
    setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
    setStatusMessage('');
    setUserName('');
    setIsUserNameSet(false);
    setHasWon(false);
    setCooldownEndTime(null);
    setTimeLeft('');
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {isUserNameSet && (
        <button
          onClick={handleQuit}
          className="absolute top-4 right-4 text-white text-3xl focus:outline-none"
          aria-label="Quit Game"
        >
          &times;
        </button>
      )}
      {!isUserNameSet ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-4xl font-bold mb-6">Enter Player Name</h1>
          <form onSubmit={handleNameSubmit} className="flex flex-col items-center">
            <input
              type="text"
              value={userName}
              required
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Player One"
              className="mb-4 p-2 text-black rounded-lg bg-white text-center"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-yellow-500 text-black rounded-xl shadow-lg text-lg font-bold hover:bg-yellow-400 transition-all duration-300"
            >
              Start Game
            </button>
          </form>
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-bold mb-6">Slot Machine</h1>
          <h3 className="text-2xl font-bold mb-6">Player: {userName}</h3>
          <div className="flex space-x-4 bg-gray-700 p-6 rounded-lg shadow-lg border-4 border-yellow-500">
            {reels.map((reel, index) => (
              <motion.div
                key={index}
                className="text-6xl"
                animate={{ rotate: spinning ? 360 : 0 }}
                transition={spinning ? { duration: 2, ease: 'easeInOut' } : { duration: 0 }}
              >
                {reel ? reel.icon : <span className="opacity-50">?</span>}
              </motion.div>
            ))}
          </div>
          <div className="mt-6">
            {hasWon ? (
              <button
                onClick={handleNewGame}
                disabled={spinning}
                className="px-6 py-3 bg-yellow-500 text-black rounded-xl shadow-lg text-lg font-bold hover:bg-yellow-400 transition-all duration-300 disabled:opacity-50"
              >
                New Game  
              </button>
            ) : remainingRetries > 0 ? (
              <button
                onClick={spin}
                disabled={spinning || cooldownEndTime}
                className="px-6 py-3 bg-yellow-500 text-black rounded-xl shadow-lg text-lg font-bold hover:bg-yellow-400 transition-all duration-300 disabled:opacity-50"
              >
                {spinning ? 'Spinning...' : `Spin (${remainingRetries} left)`}
              </button>
            ) : (
              <div className="px-6 py-3 bg-gray-500 rounded-xl text-lg font-bold">
                Game Over
              </div>
            )}
          </div>
          {cooldownEndTime && (
            <p className="mt-4 text-yellow-400 text-lg font-mono">
              Cooldown active. Try again in: {timeLeft}
            </p>
          )}
          {statusMessage && <p className="mt-4 text-lg">{statusMessage}</p>}
        </>
      )}
    </div>
  );
};

export default SlotMachine;
