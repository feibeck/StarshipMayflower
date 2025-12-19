import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { register, selectAuthenticated } from './store/auth.slice';
import { AppDispatch } from './store/store';

export function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectAuthenticated);

  const from = location.state?.from?.pathname || '/';

  // Redirect to lobby if already authenticated (e.g., after session restore)
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = formData.get('username') as string;

    dispatch(register(username)).then(() => {
      navigate(from);
    });
  }

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Username: <input name="username" type="text" />
        </label>{' '}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
