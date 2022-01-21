import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUsername } from '../store/auth.slice';

export const Lobby = () => {
  const username = useSelector(selectUsername);
  const navigate = useNavigate();
  return (
    <>
      <h3>Lobby</h3>
      <p>Welcome {username}! </p>
    </>
  );
};
