import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DinoGame } from './DinoGame';
import { http } from '../../services/http';
import { isAuthenticated } from '../../services/auth';
import './Game.css';

const Game = () => {
  const gameContainerRef = useRef(null);
  const gameInstanceRef = useRef(null);
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [lastScore, setLastScore] = useState(0);

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (!isAuthenticated()) {
      navigate('/sign-in');
      return;
    }

    // Khởi tạo game khi component mount
    if (gameContainerRef.current && !gameInstanceRef.current) {
      gameInstanceRef.current = new DinoGame(gameContainerRef.current, {
        onGameOver: handleGameOver
      });
    }

    // Cleanup khi component unmount
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
        gameInstanceRef.current = null;
      }
    };
  }, [navigate]);

  const handleGameOver = async (score) => {
    try {
      setIsSubmitting(true);
      setLastScore(score);
      setMessage('');

      // Gửi điểm số lên server
      await http('/api/ScoreSubmission/submit', {
        method: 'POST',
        body: JSON.stringify({ score: parseInt(score) })
      });

      setMessage(`Điểm ${score} đã được lưu thành công!`);
      
      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setMessage('');
      }, 3000);

    } catch (error) {
      console.error('Lỗi khi gửi điểm:', error);
      setMessage('Không thể lưu điểm. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackHome = () => {
    navigate('/');
  };

  const handleRestart = () => {
    if (gameInstanceRef.current && gameInstanceRef.current.gameInstance) {
      gameInstanceRef.current.gameInstance.restart();
    }
    setMessage('');
  };

  return (
    <div className="game-page">
      <div className="game-header">
        <button onClick={handleBackHome} className="back-button">
          ← Về Trang Chủ
        </button>
        <h1>T-Rex Game</h1>
        <button onClick={handleRestart} className="restart-button">
          Chơi Lại
        </button>
      </div>

      <div className="game-wrapper">
        <div ref={gameContainerRef} className="game-container">
          {/* Game sẽ được render vào đây */}
        </div>

        {/* Overlay khi đang gửi điểm */}
        {isSubmitting && (
          <div className="game-overlay">
            <div className="overlay-content">
              <div className="loading-spinner"></div>
              <p>Đang lưu điểm {lastScore}...</p>
            </div>
          </div>
        )}

        {/* Thông báo kết quả */}
        {message && (
          <div className={`game-message ${message.includes('thành công') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="game-instructions">
        <h3>Hướng dẫn chơi:</h3>
        <ul>
          <li><strong>Space</strong> hoặc <strong>↑</strong>: Nhảy</li>
          <li><strong>↓</strong>: Cúi xuống (khi nhảy)</li>
          <li><strong>Enter</strong>: Chơi lại khi thua</li>
        </ul>
        <p>Tránh các chướng ngại vật để đạt điểm cao nhất!</p>
      </div>
    </div>
  );
};

export default Game;
