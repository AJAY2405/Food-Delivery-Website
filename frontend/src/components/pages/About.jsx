import {
  UtensilsCrossed,
  Clock3,
  Bike,
  HeartHandshake,
  Users,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const features = [
  {
    icon: Clock3,
    title: "Fast Delivery",
    description:
      "Hot and fresh meals delivered to your doorstep in the shortest possible time.",
  },
  {
    icon: UtensilsCrossed,
    title: "Quality Food",
    description:
      "We partner with trusted restaurants to serve delicious and hygienic food every day.",
  },
  {
    icon: Bike,
    title: "Live Order Tracking",
    description:
      "Track your order in real time from the restaurant to your location.",
  },
  {
    icon: HeartHandshake,
    title: "Customer First",
    description:
      "Your satisfaction is our priority. We provide reliable support whenever you need help.",
  },
];

const stats = [
  { number: "50+", label: "Restaurant Partners" },
  { number: "10K+", label: "Happy Customers" },
  { number: "25K+", label: "Orders Delivered" },
  { number: "4.9★", label: "Customer Rating" },
];

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="bg-orange-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-r from-orange-300 to-orange-400 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About FoodExpress
          </h1>

          <p className="max-w-3xl mx-auto text-lg text-orange-100 leading-8">
            FoodExpress connects people with their favorite restaurants through
            a fast, secure, and convenient food delivery platform. We believe
            that delicious food should always be just a few clicks away.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900"
              alt="Restaurant"
              className="rounded-3xl shadow-xl object-cover h-[450px] w-full"
            />
          </div>

          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>

            <p className="text-gray-600 leading-8 mb-6">
              FoodExpress was created with one goal—to make food ordering
              simple, quick, and enjoyable. Whether you're craving pizza,
              burgers, Indian cuisine, desserts, or healthy meals, our platform
              brings hundreds of restaurants together in one place.
            </p>

            <p className="text-gray-600 leading-8">
              We work closely with restaurant partners and delivery riders to
              ensure every order arrives fresh, on time, and with the highest
              quality service.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-14">
            Why Choose Us?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="bg-orange-50 rounded-3xl p-8 text-center hover:shadow-xl transition"
                >
                  <div className="w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Icon className="text-white" size={30} />
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-gray-800">
                    {item.title}
                  </h3>

                  <p className="text-gray-600 leading-7">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg text-center"
              >
                <h3 className="text-4xl font-bold text-orange-600 mb-2">
                  {stat.number}
                </h3>

                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-orange-400 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Users className="mx-auto mb-6" size={50} />

          <h2 className="text-4xl font-bold mb-6">Our Mission</h2>

          <p className="text-lg leading-8 text-orange-100">
            Our mission is to connect customers with great restaurants through
            technology, making every meal fast, fresh, and enjoyable while
            supporting local businesses and creating opportunities for delivery
            partners.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Star className="mx-auto text-orange-300 mb-5" size={48} />

          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Ready to Order?
          </h2>

          <p className="text-gray-600 mb-8">
            Explore hundreds of delicious dishes from your favorite restaurants
            and enjoy fast delivery right to your doorstep.
          </p>

          <button
            onClick={() => navigate("/customer/browse")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition"
          >
            Order Now
          </button>
        </div>
      </section>
    </div>
  );
}
