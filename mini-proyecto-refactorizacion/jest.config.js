export default {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost/",
  },
  transform: {},
  collectCoverageFrom: ["src/models/**/*.js", "src/services/**/*.js"],
};
