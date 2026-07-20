import { useEffect, useState } from "react";
import Logo from "../../assets/Logo.png"; 

const Loader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let value = 0;

    const interval = setInterval(() => {
      value += 2;

      if (value >= 100) {
        value = 100;
        clearInterval(interval);
      }

      setProgress(value);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      {/* Restaurant Logo */}
      <img
        src={Logo}
        alt="QuickBite Logo"
        className="w-28 h-28 object-contain mb-2 animate-pulse"
      />

      {/* Logo Text */}
      <h1 className="text-4xl font-extrabold mb-8">
        Quick<span className="text-orange-500">Bite</span>
      </h1>

      {/* Progress Tube */}
      <div className="w-72 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-200 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Percentage */}
      <p className="mt-4 text-lg font-semibold text-gray-700">
        {progress}%
      </p>

      <p className="mt-2 text-gray-500">
        Loading delicious food...
      </p>
    </div>
  );
};

export default Loader;