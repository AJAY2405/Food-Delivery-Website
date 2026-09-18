import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, UtensilsCrossed } from "lucide-react";
import AllFoods from "./AllFoods";
import CustomerBrowse from "./CustomerBrowse";

const CustomerHomepage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [search] = useState(location.state?.search || "");
  const [heroLoaded, setHeroLoaded] = useState(false);

  const savedUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (location.state?.search) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  const goToBrowse = () => {
    navigate("/customer/browse");
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-14px) scale(1.04); }
        }
        .hero-fade {
          opacity: 0;
        }
        .hero-fade.is-in {
          animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .blob-float {
          animation: floatSlow 9s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-fade { opacity: 1 !important; animation: none !important; }
          .blob-float { animation: none !important; }
        }
      `}</style>

      {/* Hero */}
      <div className="relative overflow-hidden bg-[#FFD8BC]">
        <div className="blob-float absolute -top-32 -left-32 w-80 h-80 bg-orange-300/30 rounded-full blur-3xl" />
        <div
          className="blob-float absolute top-10 right-10 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl"
          style={{ animationDelay: "2.5s" }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:py-24 text-center sm:text-left">
          <p
            className={`hero-fade ${heroLoaded ? "is-in" : ""} text-sm font-medium text-orange-700`}
            style={{ animationDelay: "0.05s" }}
          >
            {savedUser?.username ? `Hey ${savedUser.username}, hungry?` : "Hungry?"}
          </p>

          <h1
            className={`hero-fade ${heroLoaded ? "is-in" : ""} text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-3 max-w-xl mx-auto sm:mx-0`}
            style={{ animationDelay: "0.15s" }}
          >
            Order food from the best restaurants near you
          </h1>

          <p
            className={`hero-fade ${heroLoaded ? "is-in" : ""} text-gray-700 mt-3 max-w-md mx-auto sm:mx-0`}
            style={{ animationDelay: "0.28s" }}
          >
            Browse menus, compare dishes and get your favorites delivered.
          </p>

          <div
            className={`hero-fade ${heroLoaded ? "is-in" : ""} mt-8`}
            style={{ animationDelay: "0.4s" }}
          >
            <button
              onClick={goToBrowse}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold px-6 h-12 shadow-sm hover:shadow-lg hover:from-orange-600 hover:to-orange-600 transition-all duration-200 hover:scale-[1.03] active:scale-95"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Browse Food
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5 group-hover:rotate-[-90deg]" />
            </button>
          </div>
        </div>
      </div>

      {/* Food section */}
      <div className="mx-auto max-w-5xl px-4 py-5 scroll-mt-6">
        {!search.trim() && <CustomerBrowse />}
      </div>
    </div>
  );
};

export default CustomerHomepage;















// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { Search, MapPin, UtensilsCrossed, Store, PackageCheck } from "lucide-react";
// import CustomerBrowse from "./CustomerBrowse";

// const CustomerHomepage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [search] = useState(location.state?.search || "");
//   const [heroLoaded, setHeroLoaded] = useState(false);
//   const [searchText, setSearchText] = useState("");

//   const savedUser = JSON.parse(localStorage.getItem("user") || "null");

//   useEffect(() => {
//     if (location.state?.search) {
//       window.history.replaceState({}, document.title);
//     }
//   }, [location.state]);

//   useEffect(() => {
//     // Re-triggers on every mount, so it plays again on refresh/navigation back
//     setHeroLoaded(false);
//     const t = setTimeout(() => setHeroLoaded(true), 60);
//     return () => clearTimeout(t);
//   }, []);

//   const goToBrowse = () => {
//     navigate("/customer/browse", {
//       state: {
//         search: searchText,
//       },
//     });
//   };

//   const stats = [
//     { icon: Store, value: "3,00,000+", label: "restaurants" },
//     { icon: MapPin, value: "800+", label: "cities" },
//     { icon: PackageCheck, value: "3 billion+", label: "orders delivered" },
//   ];

//   return (
//     <div className="w-full overflow-hidden bg-[#FFF8F2]">

//       {/* ================= HERO ================= */}
//       <section className="relative mx-auto flex min-h-[640px] w-full max-w-[1880px] items-center justify-center overflow-hidden rounded-b-3xl bg-[#FFF8F2] py-16 md:min-h-[720px]">

//         {/* ================= DOODLE LINES (behind everything) ================= */}
//         <svg
//           className="pointer-events-none absolute left-0 top-0 z-0 h-full w-[55%] opacity-70"
//           viewBox="0 0 500 700"
//           fill="none"
//         >
//           <path
//             d="M20 40C120 10 180 90 100 150C20 210 -40 130 40 90C120 50 220 90 200 190C180 290 60 300 90 400C120 500 260 480 260 580"
//             stroke="#FBD3D8"
//             strokeWidth="2.5"
//           />
//         </svg>
//         <svg
//           className="pointer-events-none absolute right-0 top-0 z-0 h-full w-[55%] opacity-70"
//           viewBox="0 0 500 700"
//           fill="none"
//         >
//           <path
//             d="M480 60C380 30 360 120 440 150C520 180 480 260 400 240C320 220 300 300 380 340C460 380 420 460 340 460C260 460 260 540 320 580"
//             stroke="#FBD3D8"
//             strokeWidth="2.5"
//           />
//         </svg>

//         {/* ================= MAIN CONTENT ================= */}
//         <div className="relative z-20 flex w-full flex-col items-center justify-center gap-6 px-5 text-center">

//           {/* Greeting */}
//           <p
//             className={`hero-fade text-sm font-medium text-orange-600 md:text-base ${heroLoaded ? "hero-show" : ""}`}
//             style={{ animationDelay: "0.05s" }}
//           >
//             {savedUser?.username
//               ? `Hey ${savedUser.username}, hungry?`
//               : "Hungry?"}
//           </p>

//           {/* Heading */}
//           <h1
//             className={`hero-fade w-full max-w-3xl text-4xl font-bold leading-tight text-[#E23744] sm:text-5xl md:text-6xl ${heroLoaded ? "hero-show" : ""}`}
//             style={{ animationDelay: "0.15s" }}
//           >
//             Better food for
//             <br />
//             more people
//           </h1>

//           {/* Subtitle */}
//           <p
//             className={`hero-fade max-w-2xl text-base font-light leading-relaxed text-gray-500 sm:text-lg ${heroLoaded ? "hero-show" : ""}`}
//             style={{ animationDelay: "0.25s" }}
//           >
//             For over a decade, we've enabled our customers to discover new
//             tastes,
//             <br className="hidden sm:block" />
//             delivered right to their doorstep
//           </p>

//           {/* ================= SEARCH ================= */}
//           {/* <div
//             className={`hero-fade mt-2 flex w-full max-w-2xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-[0_8px_35px_rgba(0,0,0,0.12)] sm:flex-row ${heroLoaded ? "hero-show" : ""}`}
//             style={{ animationDelay: "0.35s" }}
//           >
//             <div className="flex h-12 flex-1 items-center rounded-xl border border-gray-200 px-4">
//               <MapPin className="mr-3 h-5 w-5 shrink-0 text-[#E23744]" />
//               <input
//                 type="text"
//                 placeholder="Enter your location"
//                 className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
//               />
//             </div>

//             <div className="flex h-12 flex-1 items-center rounded-xl border border-gray-200 px-4">
//               <Search className="mr-3 h-5 w-5 shrink-0 text-gray-400" />
//               <input
//                 type="text"
//                 value={searchText}
//                 onChange={(e) => setSearchText(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     goToBrowse();
//                   }
//                 }}
//                 placeholder="Search for food or restaurant"
//                 className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
//               />
//             </div>

//             <button
//               onClick={goToBrowse}
//               className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#E23744] px-7 font-semibold text-white transition-all duration-200 hover:bg-[#d62839] hover:shadow-lg active:scale-95"
//             >
//               <Search className="h-4 w-4" />
//               Search
//             </button>
//           </div> */}

//           {/* ================= BROWSE FOOD BUTTON ================= */}
//           <button
//             onClick={() => navigate("/customer/browse")}
//             className={`hero-fade flex items-center justify-center gap-2 rounded-xl border-2 border-[#E23744] bg-white px-7 py-3 font-semibold text-[#E23744] transition-all duration-200 hover:bg-[#E23744] hover:text-white hover:shadow-lg active:scale-95 ${heroLoaded ? "hero-show" : ""}`}
//             style={{ animationDelay: "0.42s" }}
//           >
//             <UtensilsCrossed className="h-4 w-4" />
//             Browse Food
//           </button>

//           {/* ================= STATS BAR ================= */}
//           {/* <div
//             className={`hero-fade mt-6 flex w-full max-w-3xl flex-col items-stretch justify-center gap-4 rounded-2xl bg-white p-5 shadow-[0_8px_35px_rgba(0,0,0,0.1)] sm:flex-row sm:items-center sm:gap-0 sm:divide-x sm:divide-gray-200 ${heroLoaded ? "hero-show" : ""}`}
//             style={{ animationDelay: "0.5s" }}
//           >
//             {stats.map(({ icon: Icon, value, label }) => (
//               <div
//                 key={label}
//                 className="flex flex-1 items-center justify-center gap-3 px-2 sm:px-6"
//               >
//                 <div className="text-left">
//                   <p className="text-lg font-bold text-gray-900 sm:text-xl">
//                     {value}
//                   </p>
//                   <p className="text-sm text-gray-500">{label}</p>
//                 </div>
//                 <Icon className="h-8 w-8 shrink-0 text-[#E23744]" />
//               </div>
//             ))}
//           </div> */}
//         </div>

//         {/* ================= FOOD IMAGES ================= */}

//         {/* Left Food - Burger */}
//         <img
//           src="https://b.zmtcdn.com/data/o2_assets/110a09a9d81f0e5305041c1b507d0f391743058910.png"
//           alt="Burger"
//           className="blob-float absolute left-[2%] top-[38%] z-10 block w-[90px] rounded-lg opacity-90 sm:left-[5%] sm:top-[40%] sm:w-[150px] sm:opacity-100 md:w-[190px] xl:left-[10%]"
//         />

//         {/* Right Top Food - Dumplings */}
//         <img
//           src="https://b.zmtcdn.com/data/o2_assets/b4f62434088b0ddfa9b370991f58ca601743060218.png"
//           alt="Dumplings"
//           className="blob-float absolute right-[3%] top-[10%] z-10 block w-[80px] rounded-lg opacity-90 sm:right-[6%] sm:top-[12%] sm:w-[140px] sm:opacity-100 md:w-[170px] xl:right-[12%]"
//           style={{ animationDelay: "1.2s" }}
//         />

//         {/* Right Bottom Food - Pizza */}
//         <img
//           src="https://b.zmtcdn.com/data/o2_assets/316495f4ba2a9c9d9aa97fed9fe61cf71743059024.png"
//           alt="Pizza"
//           className="blob-float absolute bottom-[16%] right-[2%] z-10 block w-[90px] rounded-lg opacity-90 sm:bottom-[18%] sm:right-[5%] sm:w-[150px] sm:opacity-100 md:w-[190px] xl:right-[10%]"
//           style={{ animationDelay: "2.4s" }}
//         />

//         {/* Decorative Item - top center leaf */}
//         <img
//           src="https://b.zmtcdn.com/data/o2_assets/70b50e1a48a82437bfa2bed925b862701742892555.png"
//           alt=""
//           className="blob-float absolute left-[24%] top-[6%] hidden w-10 rotate-2 xl:block"
//         />

//         {/* Decorative Item - tomato slice right */}
//         <img
//           src="https://b.zmtcdn.com/data/o2_assets/9ef1cc6ecf1d92798507ffad71e9492d1742892584.png"
//           alt=""
//           className="blob-float absolute right-[15%] top-[38%] hidden w-9 rotate-45 xl:block"
//           style={{ animationDelay: "0.8s" }}
//         />

//         {/* Decorative Item - tomato slice left */}
//         <img
//           src="https://b.zmtcdn.com/data/o2_assets/9ef1cc6ecf1d92798507ffad71e9492d1742892584.png"
//           alt=""
//           className="blob-float absolute bottom-[30%] left-[16%] hidden w-9 -rotate-12 xl:block"
//           style={{ animationDelay: "1.6s" }}
//         />
//       </section>

//       {/* ================= FOOD SECTION ================= */}
//       <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
//         {!search.trim() && <CustomerBrowse />}
//       </section>

//       {/* ================= ANIMATIONS ================= */}
//       <style>{`
//         @keyframes fadeUp {
//           from {
//             opacity: 0;
//             transform: translateY(22px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes floatSlow {
//           0%, 100% {
//             transform: translateY(0) scale(1);
//           }
//           50% {
//             transform: translateY(-12px) scale(1.03);
//           }
//         }

//         .hero-fade {
//           opacity: 0;
//         }

//         .hero-fade.hero-show {
//           animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
//         }

//         .blob-float {
//           animation: floatSlow 6s ease-in-out infinite;
//         }

//         @media (prefers-reduced-motion: reduce) {
//           .hero-fade {
//             opacity: 1 !important;
//             animation: none !important;
//           }
//           .blob-float {
//             animation: none !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CustomerHomepage;