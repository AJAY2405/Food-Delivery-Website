import React from "react";
import { getData } from "@/context/userContext";
import RestaurantProfile from "../Restaurants/RestaurantProfilepage";
import ProfileView from "../Customer/ProfileView";

export const Profile = () => {
  const { user } = getData();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        Please Login
      </div>
    );
  }

  return user.role === "restaurant" ? (
    <RestaurantProfile user={user} />
  ) : (
    <ProfileView user={user} />
  );
};

export default Profile;
