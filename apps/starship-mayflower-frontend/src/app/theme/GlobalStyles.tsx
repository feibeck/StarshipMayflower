import { Global, css } from '@emotion/react';
import { theme } from './theme';

export const GlobalStyles = () => (
  <Global
    styles={css`
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      html,
      body,
      #root {
        height: 100%;
        width: 100%;
      }

      body {
        font-family: ${theme.typography.fontFamily};
        font-size: ${theme.typography.fontSize.md};
        color: ${theme.colors.text};
        background-color: ${theme.colors.background};
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      button {
        font-family: ${theme.typography.fontFamily};
        cursor: pointer;
        border: none;
        background: none;
        color: inherit;
      }

      input {
        font-family: ${theme.typography.fontFamily};
      }

      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      ::-webkit-scrollbar-track {
        background: ${theme.colors.background};
      }

      ::-webkit-scrollbar-thumb {
        background: ${theme.colors.surface};
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: ${theme.colors.surfaceHover};
      }
    `}
  />
);
