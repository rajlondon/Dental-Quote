import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Extend global CSS with custom styles
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root {
    --primary: 195 100% 27%;
    --primary-dark: 195 100% 20%;
    --primary-light: 195 100% 33%;
    --secondary: 174 60% 56%;
    --secondary-dark: 174 60% 46%;
    --secondary-light: 174 60% 66%;
    --accent: 0 100% 70%;
  }

  body {
    font-family: 'Open Sans', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
  }
`;

createRoot(document.getElementById("root")!).render(
  <>
    <GlobalStyle />
    <App />
  </>
);
