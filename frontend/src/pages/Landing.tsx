import chatSideImage from "../assets/586664484802Online_Discussion.gif";
import { motion } from "motion/react"
const Landing = () => {
  return (
    <>
      <div className="bg-[url('/src/assets/wave-haikei.svg')] bg-no-repeat bg-fixed bg-cover flex flex-col items-center ">
        <div className=" grid grid-cols-2 h-full w-full py-10 px-auto md:px-0">
          <motion.div animate={{transform: "translateX(0)", opacity: 1}} initial={{transform: "translateX(-200px)", opacity: 0}} transition={{duration: 0.7}} className="flex flex-col justify-center items-center text-center">
            <div className="flex flex-col justify-center items-center w-full">
              <h1 className="text-7xl font-logo text-balance font-semibold mb-4 text-white">
                Connect in the
              </h1>
              <span className="font-logo text-8xl text-center font-bold text-transparent [-webkit-text-stroke:2px_#2563eb] ">
                Loop
              </span>
            </div>
            <p className="text-center text-white text-xl mt-6 max-w-2xl ">
              Experience seamless conversations with friends, communities, and
              teams. Modern chat reimagined for the way you communicate today.
            </p>

            <div>
              <button className="mt-10 bg-white text-blue-600 font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 cursor-pointer">
                Get Started
              </button>
            </div>
          </motion.div>
          <div className="flex justify-center items-center ">
            <img src={chatSideImage} className="hidden md:block size-11/12 " />
          </div>
        </div>
        <motion.div initial={{ opacity: 0.2 , scale: 0.8 }} whileInView={{ opacity: 1 , scale: 1 }} className="bg-green-600 w-[70%] h-[60vh] mx-auto flex justify-center items-center transition-all duration-800" >
            <h1 className="text-4xl text-white font-bold">Animation Test</h1>
        </motion.div>


      </div>

      
    </>
  );
};

export default Landing;
