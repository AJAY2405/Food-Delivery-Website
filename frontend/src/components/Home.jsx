import { getData } from "@/context/userContext";
import CustomerHome from "./Customer/Customerhomepage";
import RestaurantHome from "./Restaurants/RestaurantHome";

const Home = () => {
  const { user } = getData();

  if (!user) {
    return <CustomerHome />;
  }

  if (user.role === "restaurant") {
    return <RestaurantHome />;
  }

  return <CustomerHome />;
};

export default Home;