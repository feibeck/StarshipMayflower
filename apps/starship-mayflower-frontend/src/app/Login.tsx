import styled from '@emotion/styled';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { register, selectAuthenticated } from './store/auth.slice';
import { AppDispatch } from './store/store';
import { theme } from './theme';

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${theme.colors.background};
  padding: ${theme.spacing.xl};
`;

const LoginCard = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xxl};
  box-shadow: ${theme.shadows.lg};
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  margin: 0 0 ${theme.spacing.xl} 0;
  font-size: ${theme.typography.fontSize.xxl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  text-shadow: ${theme.shadows.glow};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  color: ${theme.colors.text};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const Input = styled.input`
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.md};
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(0, 217, 255, 0.2);
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const LoginButton = styled.button`
  padding: ${theme.spacing.md};
  background: ${theme.colors.primary};
  color: ${theme.colors.background};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  margin-top: ${theme.spacing.md};

  &:hover {
    background: ${theme.colors.primary};
    box-shadow: ${theme.shadows.glow};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

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
    <LoginContainer>
      <LoginCard>
        <Title>Login</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              required
            />
          </FormGroup>
          <LoginButton type="submit">Login</LoginButton>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
}
