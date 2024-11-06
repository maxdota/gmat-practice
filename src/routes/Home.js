const apiKey = process.env.REACT_APP_API_KEY;
const Home = () => {
  return <h1>Home page 1.0, Secret: { apiKey }</h1>;
};
export default Home;