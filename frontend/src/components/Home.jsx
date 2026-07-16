import { getData } from "@/context/userContext";
import CustomerHome from "./Customer/Customerhomepage";
import RestaurantHome from "./Restaurants/RestaurantHome";
import RiderDashboard from "./Rider/RiderDashboard";
// import AvailableOrders from "./Rider/AvailableOrders";

const Home = () => {
  const { user } = getData();

  if (!user) {
    return <CustomerHome />;
  }

  if (user.role === "restaurant") {
    return <RestaurantHome />;
  }
  if (user.role === "rider") {
    return <RiderDashboard />;
  }

  return <CustomerHome />;
};

export default Home;