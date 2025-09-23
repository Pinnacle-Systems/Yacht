import { createTw } from "react-pdf-tailwind";

const tw = createTw({
  theme: {
    // You can extend or override Tailwind's default theme here
    extend: {
      colors: {
        primary: "#3490dc",
        secondary: "#ffed4a",
      },
      fontFamily: {
        sans: ["Roboto", "Arial", "sans-serif"],
      },
    },
  },
});

export default tw;
