import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import GradientButton from "@/components/ui/gradient-button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Sparkles,
} from "lucide-react";
import WalletConnectModal from "@/components/wallet-connect-modal";
import {
  connectWallet,
  disconnectWallet,
  getWalletAddress,
} from "@/lib/wallet";
import { formatWalletAddress } from "@/lib/utils";

const Navigation = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Check if user has scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Initialize wallet on component mount
  useEffect(() => {
    const initWallet = async () => {
      const address = await getWalletAddress();
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
      }
    };
    initWallet();
  }, []);

  // Update wallet connection handler
  const handleWalletConnect = async (walletType: string) => {
    setIsModalOpen(false);

    try {
      toast({
        title: "Connecting Wallet",
        description: `Connecting to ${walletType}...`,
      });

      const address = await connectWallet();
      setWalletAddress(address);
      setIsConnected(true);

      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${walletType}`,
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update disconnect handler
  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setIsConnected(false);
      setWalletAddress("");
      setIsProfileMenuOpen(false);

      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Navigation animations
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const logoVariants = {
    initial: { textShadow: "0 0 5px #00bbff" },
    animate: {
      textShadow: ["0 0 5px #00bbff", "0 0 15px #00bbff", "0 0 5px #00bbff"],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "Create DAO", path: "/create-dao" },
  ];

  return (
    <nav
      className={cn(
        "w-full fixed top-0 z-50 transition-all duration-300",
        scrolled
          ? "backdrop-blur-xl bg-black/30 py-2 shadow-lg"
          : "backdrop-blur-lg bg-black/20 py-4"
      )}
    >
      <motion.div
        className="container mx-auto px-4 flex justify-between items-center"
        initial="hidden"
        animate="visible"
        variants={navVariants}
      >
        <Link to="/" className="flex items-center">
          <motion.div
            className="mr-2"
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{
              rotate: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Sparkles className="h-6 w-6 text-daoship-primary" />
          </motion.div>
          <motion.div
            className="text-2xl font-bold"
            // variants={logoVariants}
            initial="initial"
            animate="animate"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              DAOShip
            </span>
          </motion.div>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <motion.div key={item.path} variants={navItemVariants}>
              <Link
                to={item.path}
                className={cn(
                  "text-white hover:text-daoship-primary transition-colors relative",
                  location.pathname === item.path && "text-daoship-primary"
                )}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-daoship-primary"
                    layoutId="navIndicator"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}

          {isConnected ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                <span className="mr-1 font-mono text-sm">
                  {formatWalletAddress(walletAddress)}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isProfileMenuOpen && "transform rotate-180"
                  )}
                />
              </motion.button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-lg rounded-lg shadow-lg p-1 z-10 border border-white/10"
                  >
                    <motion.div
                      className="px-4 py-3 border-b border-white/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="text-sm text-white/70">Connected as</div>
                      <div className="font-medium text-white truncate">
                        {walletAddress}
                      </div>
                    </motion.div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 rounded-md"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Your Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 rounded-md"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleDisconnect}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Disconnect
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div variants={navItemVariants}>
              <GradientButton
                onClick={() => setIsModalOpen(true)}
                className="flex items-center"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </GradientButton>
            </motion.div>
          )}
        </div>

        {/* Mobile menu button */}
        <motion.div className="md:hidden" variants={navItemVariants}>
          <motion.button
            className="text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden absolute w-full bg-black/80 backdrop-blur-xl border-t border-white/10"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileMenuVariants}
          >
            <motion.div className="px-4 py-4 space-y-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  variants={navItemVariants}
                  custom={index}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "block py-2 text-white hover:text-daoship-primary transition-colors",
                      location.pathname === item.path && "text-daoship-primary"
                    )}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}

              {isConnected ? (
                <motion.div variants={navItemVariants} custom={navItems.length}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                      <span className="text-white">{walletAddress}</span>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div variants={navItemVariants} custom={navItems.length}>
                  <GradientButton
                    onClick={() => setIsModalOpen(true)}
                    className="w-full"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </GradientButton>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleWalletConnect}
      />
    </nav>
  );
};

export default Navigation;
