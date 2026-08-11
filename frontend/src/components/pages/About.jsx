// import {
//   UtensilsCrossed,
//   Clock3,
//   Bike,
//   HeartHandshake,
//   Users,
//   Star,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// const features = [
//   {
//     icon: Clock3,
//     title: "Fast Delivery",
//     description:
//       "Hot and fresh meals delivered to your doorstep in the shortest possible time.",
//   },
//   {
//     icon: UtensilsCrossed,
//     title: "Quality Food",
//     description:
//       "We partner with trusted restaurants to serve delicious and hygienic food every day.",
//   },
//   {
//     icon: Bike,
//     title: "Live Order Tracking",
//     description:
//       "Track your order in real time from the restaurant to your location.",
//   },
//   {
//     icon: HeartHandshake,
//     title: "Customer First",
//     description:
//       "Your satisfaction is our priority. We provide reliable support whenever you need help.",
//   },
// ];

// const stats = [
//   { number: "50+", label: "Restaurant Partners" },
//   { number: "10K+", label: "Happy Customers" },
//   { number: "25K+", label: "Orders Delivered" },
//   { number: "4.9★", label: "Customer Rating" },
// ];

// export default function About() {
//   const navigate = useNavigate();
//   return (
//     <div className="bg-orange-50 min-h-screen">
//       {/* Hero */}
//       <section className="bg-gradient-to-r from-orange-400 to-orange-400 text-white">
//         <div className="max-w-7xl mx-auto px-6 py-24 text-center">
//           <h1 className="text-5xl md:text-6xl font-bold mb-6">
//             About QuickBite
//           </h1>

//           <p className="max-w-3xl mx-auto text-lg text-orange-100 leading-8">
//             QuickBite connects people with their favorite restaurants through
//             a fast, secure, and convenient food delivery platform. We believe
//             that delicious food should always be just a few clicks away.
//           </p>
//         </div>
//       </section>

//       {/* Story */}
//       <section className="max-w-7xl mx-auto px-6 py-20">
//         <div className="grid lg:grid-cols-2 gap-12 items-center">
//           <div>
//             <img
//               src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900"
//               alt="Restaurant"
//               className="rounded-3xl shadow-xl object-cover h-[450px] w-full"
//             />
//           </div>

//           <div>
//             <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>

//             <p className="text-gray-600 leading-8 mb-6">
//               QuickBite was created with one goal—to make food ordering
//               simple, quick, and enjoyable. Whether you're craving pizza,
//               burgers, Indian cuisine, desserts, or healthy meals, our platform
//               brings hundreds of restaurants together in one place.
//             </p>

//             <p className="text-gray-600 leading-8">
//               We work closely with restaurant partners and delivery riders to
//               ensure every order arrives fresh, on time, and with the highest
//               quality service.
//             </p>
//           </div>
//         </div>
//       </section>
      

//       {/* Features */}
//       <section className="bg-white py-20">
//         <div className="max-w-7xl mx-auto px-6">
//           <h2 className="text-4xl font-bold text-center text-gray-800 mb-14">
//             Why Choose Us?
//           </h2>

//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {features.map((item, index) => {
//               const Icon = item.icon;

//               return (
//                 <div
//                   key={index}
//                   className="bg-orange-50 rounded-3xl p-8 text-center hover:shadow-xl transition"
//                 >
//                   <div className="w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center mx-auto mb-5">
//                     <Icon className="text-white" size={30} />
//                   </div>

//                   <h3 className="text-xl font-bold mb-3 text-gray-800">
//                     {item.title}
//                   </h3>

//                   <p className="text-gray-600 leading-7">{item.description}</p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Statistics */}
//       {/* <section className="py-20">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
//             {stats.map((stat, index) => (
//               <div
//                 key={index}
//                 className="bg-white rounded-3xl p-8 shadow-lg text-center"
//               >
//                 <h3 className="text-4xl font-bold text-orange-600 mb-2">
//                   {stat.number}
//                 </h3>

//                 <p className="text-gray-600">{stat.label}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section> */}

//       {/* Mission */}
//       <section className="bg-orange-400 text-white py-20">
//         <div className="max-w-4xl mx-auto px-6 text-center">
//           <Users className="mx-auto mb-6" size={50} />

//           <h2 className="text-4xl font-bold mb-6">Our Mission</h2>

//           <p className="text-lg leading-8 text-orange-100">
//             Our mission is to connect customers with great restaurants through
//             technology, making every meal fast, fresh, and enjoyable while
//             supporting local businesses and creating opportunities for delivery
//             partners.
//           </p>
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="py-20 bg-white">
//         <div className="max-w-4xl mx-auto px-6 text-center">
//           <Star className="mx-auto text-orange-300 mb-5" size={48} />

//           <h2 className="text-4xl font-bold text-gray-800 mb-4">
//             Ready to Order?
//           </h2>

//           <p className="text-gray-600 mb-8">
//             Explore hundreds of delicious dishes from your favorite restaurants
//             and enjoy fast delivery right to your doorstep.
//           </p>

//           <button
//             onClick={() => navigate("/customer/browse")}
//             className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition"
//           >
//             Order Now
//           </button>
//         </div>
//       </section>
//     </div>
//   );
// }






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

const discoverLeft = [
  {
    title: "Healthy",
    image:
      "https://b.zmtcdn.com/data/o2_assets/d0f1639403f80f8f2c19e0d538222e661742455804.png",
  },
  {
    title: "Veg Mode",
    image:
      "https://b.zmtcdn.com/data/o2_assets/82f145180cd6f920a8a8617dda366a0a1742455963.png",
  },
  {
    title: "Plan a Party",
    image:
      "https://b.zmtcdn.com/data/o2_assets/5e7aab0f183b36fc12c29279f0cb55181742462245.png",
  },
  {
    title: "Gift Cards",
    image:
      "https://b.zmtcdn.com/data/o2_assets/867f86a10503998e437963bb37c451591742455764.png",
  },
];

const discoverRight = [
  {
    title: "Gourmet",
    image:
      "https://b.zmtcdn.com/data/o2_assets/6e27c9acde6045c272a28e6eb275727e1742455789.png",
  },
  {
    title: "Offers",
    image:
      "https://b.zmtcdn.com/data/o2_assets/813952c961fd13588cb71867d84ea7dc1742455815.png",
  },
  {
    title: "Food on Train",
    image:
      "https://b.zmtcdn.com/data/o2_assets/06d090307e02772693ac06123b53459b1742455939.png",
  },
  {
    title: "Collections",
    image:
      "https://b.zmtcdn.com/data/o2_assets/5e973dd10c387878009c66d625ae541a1746550690.png",
  },
];

const DiscoverCard = ({
  title,
  image,
  className = "",
}) => {
  return (
    <div
      className={`flex aspect-[26/29] w-full flex-col items-center justify-start overflow-hidden rounded-2xl border border-gray-200 bg-white pb-2 pt-2 shadow-lg xl:rounded-3xl ${className}`}
    >
      <div className="w-full">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="mx-auto h-auto w-full"
        />
      </div>

      <div className="my-auto px-2 text-center text-sm font-normal leading-5 text-gray-700 md:px-4 xl:text-lg xl:leading-6">
        {title}
      </div>
    </div>
  );
};

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-hidden bg-gray-50">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#E23744] via-[#ed4b55] to-orange-500 py-24 text-white md:py-32">

        {/* Decorative Background */}
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-yellow-300/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-orange-100">
            About QuickBite
          </p>

          <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">
            About QuickBite
          </h1>

          <p className="mx-auto max-w-3xl text-base leading-8 text-orange-100 sm:text-lg">
            QuickBite connects people with their favorite restaurants through
            a fast, secure, and convenient food delivery platform. We believe
            that delicious food should always be just a few clicks away.
          </p>

        </div>
      </section>


      {/* =====================================================
          OUR STORY
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">

        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* Image */}
          <div>
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900"
              alt="Restaurant"
              className="h-[400px] w-full rounded-3xl object-cover shadow-xl md:h-[450px]"
            />
          </div>

          {/* Content */}
          <div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#E23744]">
              Who we are
            </p>

            <h2 className="mb-6 text-4xl font-bold text-gray-800">
              Our Story
            </h2>

            <p className="mb-6 leading-8 text-gray-600">
              QuickBite was created with one goal—to make food ordering
              simple, quick, and enjoyable. Whether you're craving pizza,
              burgers, Indian cuisine, desserts, or healthy meals, our platform
              brings hundreds of restaurants together in one place.
            </p>

            <p className="leading-8 text-gray-600">
              We work closely with restaurant partners and delivery riders to
              ensure every order arrives fresh, on time, and with the highest
              quality service.
            </p>

          </div>

        </div>
      </section>


      {/* =====================================================
          DISCOVER MORE
      ====================================================== */}
      <section className="w-full overflow-hidden bg-white py-20 md:py-24">

        {/* Heading */}
        <div className="mb-10 px-4 text-center">

          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#E23744]">
            Explore QuickBite
          </p>

          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Discover more with us
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500 md:text-base">
            From healthy meals to exclusive offers, discover everything
            QuickBite has to offer.
          </p>

        </div>


        {/* Main Layout */}
        <div className="mx-auto h-fit w-full max-w-6xl overflow-hidden px-4">

          <div
            className="
              relative mx-auto grid
              aspect-[3/1]
              w-full
              grid-cols-6
              grid-rows-2
              gap-3
              md:gap-4
              xl:max-w-[1024px]
              xl:gap-6
            "
          >

            {/* =================================================
                LEFT SIDE
            ================================================== */}
            <div
              className="
                relative
                col-span-2
                col-start-1
                row-span-2
                grid
                h-full
                grid-cols-2
                grid-rows-2
                gap-3
                md:gap-4
                xl:gap-6
              "
            >

              <DiscoverCard
                title={discoverLeft[0].title}
                image={discoverLeft[0].image}
                className="origin-bottom-right scale-75"
              />

              <DiscoverCard
                title={discoverLeft[1].title}
                image={discoverLeft[1].image}
                className="origin-bottom-left -translate-y-4 scale-75"
              />

              <DiscoverCard
                title={
                  <>
                    Plan
                    <br />
                    a Party
                  </>
                }
                image={discoverLeft[2].image}
                className="origin-top-right translate-x-4 scale-75"
              />

              <DiscoverCard
                title={discoverLeft[3].title}
                image={discoverLeft[3].image}
                className="origin-top-left -translate-x-4 -translate-y-4 scale-75"
              />

            </div>


            {/* =================================================
                CENTER MOBILE
            ================================================== */}
            <div
              className="
                relative
                col-span-2
                col-start-3
                row-span-2
                flex
                h-full
                overflow-hidden
              "
            >

              {/* Mobile Frame */}
              <div className="absolute -bottom-5 left-0 h-full w-full">

                <img
                  src="https://b.zmtcdn.com/data/o2_assets/3f7e2757e62fd22592b879bd56b666011742294630.png"
                  alt="QuickBite mobile app"
                  loading="lazy"
                  className="mx-auto h-auto w-[92%]"
                />

              </div>


              {/* Schedule Card */}
              <div className="z-20 mb-6 mt-auto aspect-[8/9] w-1/2 scale-90 xl:mb-8">

                <DiscoverCard
                  title={
                    <>
                      Schedule
                      <br />
                      your order
                    </>
                  }
                  image="https://b.zmtcdn.com/data/o2_assets/cc1caf220c91be38dd94cce12b416fcd1746550226.png"
                  className="pt-4"
                />

              </div>

            </div>


            {/* =================================================
                RIGHT SIDE
            ================================================== */}
            <div
              className="
                relative
                col-span-2
                col-start-5
                row-span-2
                grid
                h-full
                -translate-x-3
                grid-cols-2
                grid-rows-2
                gap-3
                md:gap-4
                xl:-translate-x-6
                xl:gap-6
              "
            >

              <DiscoverCard
                title={discoverRight[0].title}
                image={discoverRight[0].image}
                className="origin-bottom-right -translate-x-3 scale-75"
              />

              <DiscoverCard
                title={discoverRight[1].title}
                image={discoverRight[1].image}
                className="origin-bottom-left -translate-x-3 -translate-y-4 scale-75"
              />

              <DiscoverCard
                title={
                  <>
                    Food on
                    <br />
                    Train
                  </>
                }
                image={discoverRight[2].image}
                className="origin-top-right scale-75"
              />

              <DiscoverCard
                title={discoverRight[3].title}
                image={discoverRight[3].image}
                className="origin-top-left -translate-y-4 scale-75"
              />

            </div>


            {/* Bottom Gradient */}
            <div
              className="
                pointer-events-none
                absolute
                -bottom-14
                left-0
                h-28
                w-full
                bg-gradient-to-t
                from-white
                via-white/60
                to-transparent
              "
            />

          </div>

        </div>
      </section>


      {/* =====================================================
          WHY CHOOSE US
      ====================================================== */}
      <section className="bg-white py-20 md:py-24">

        <div className="mx-auto max-w-7xl px-6">

          {/* Heading */}
          <div className="mb-14 text-center">

            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#E23744]">
              Why QuickBite
            </p>

            <h2 className="text-4xl font-bold text-gray-800">
              Why Choose Us?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-500">
              Everything we do is focused on making your food ordering
              experience simple, reliable and enjoyable.
            </p>

          </div>


          {/* Feature Cards */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

            {features.map((item, index) => {

              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="
                    group
                    rounded-3xl
                    border
                    border-orange-100
                    bg-orange-50
                    p-8
                    text-center
                    transition-all
                    duration-300
                    hover:-translate-y-2
                    hover:shadow-xl
                  "
                >

                  <div
                    className="
                      mx-auto
                      mb-5
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-full
                      bg-gradient-to-br
                      from-[#E23744]
                      to-orange-500
                      transition-transform
                      duration-300
                      group-hover:scale-110
                    "
                  >
                    <Icon
                      className="text-white"
                      size={30}
                    />
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-gray-800">
                    {item.title}
                  </h3>

                  <p className="leading-7 text-gray-600">
                    {item.description}
                  </p>

                </div>
              );
            })}

          </div>

        </div>
      </section>


      {/* =====================================================
          STATISTICS
      ====================================================== */}
      <section className="bg-gray-50 py-20">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">

            {stats.map((stat, index) => (

              <div
                key={index}
                className="
                  rounded-3xl
                  bg-white
                  p-7
                  text-center
                  shadow-sm
                  transition
                  hover:-translate-y-1
                  hover:shadow-lg
                "
              >

                <h3 className="mb-2 text-3xl font-bold text-[#E23744] md:text-4xl">
                  {stat.number}
                </h3>

                <p className="text-sm text-gray-600 md:text-base">
                  {stat.label}
                </p>

              </div>

            ))}

          </div>

        </div>
      </section>


      {/* =====================================================
          MISSION
      ====================================================== */}
      <section className="bg-gradient-to-r from-[#E23744] to-orange-500 py-20 text-white">

        <div className="mx-auto max-w-4xl px-6 text-center">

          <Users
            className="mx-auto mb-6"
            size={50}
          />

          <h2 className="mb-6 text-4xl font-bold">
            Our Mission
          </h2>

          <p className="text-lg leading-8 text-orange-100">
            Our mission is to connect customers with great restaurants through
            technology, making every meal fast, fresh, and enjoyable while
            supporting local businesses and creating opportunities for
            delivery partners.
          </p>

        </div>
      </section>


      {/* =====================================================
          CTA
      ====================================================== */}
      <section className="bg-white py-20 md:py-24">

        <div className="mx-auto max-w-4xl px-6 text-center">

          <Star
            className="mx-auto mb-5 fill-orange-300 text-orange-300"
            size={48}
          />

          <h2 className="mb-4 text-4xl font-bold text-gray-800">
            Ready to Order?
          </h2>

          <p className="mx-auto mb-8 max-w-2xl leading-7 text-gray-600">
            Explore hundreds of delicious dishes from your favorite
            restaurants and enjoy fast delivery right to your doorstep.
          </p>

          <button
            onClick={() => navigate("/customer/browse")}
            className="
              rounded-full
              bg-orange-500
              px-8
              py-3
              font-semibold
              text-white
              shadow-md
              transition-all
              duration-200
              hover:bg-[#d62839]
              hover:shadow-lg
              active:scale-95
            "
          >
            Order Now
          </button>

        </div>
      </section>

    </div>
  );
}