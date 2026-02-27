import React from 'react';
import { MessageCircle, Users, Zap, ArrowRight, Image, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const features = [
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: "Real-time Messaging",
    description: "Instant delivery with typing indicators and live updates"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "One-to-One Chats",
    description: "Connect and collaborate seamlessly with anyone"
  },
  {
    icon: <Image className="h-6 w-6" />,
    title: "Image Sharing",
    description: "Share images with instant preview and cloud storage"
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Lightning Fast",
    description: "Optimized performance across all devices"
  }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-glow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] animate-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <nav className="fixed top-0 w-full glass z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 gradient-bg rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-text font-logo">Loop</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-text-secondary hover:text-text transition-colors text-sm">Features</a>
              <button
                onClick={() => navigate('/auth/signin')}
                className="text-text-secondary hover:text-text transition-colors text-sm cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/auth/signup')}
                className="gradient-bg text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-sm text-text-secondary">
              <Sparkles className="h-4 w-4 text-primary-light" />
              Real-time messaging, reimagined
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-text">Connect with anyone,</span>
              <br />
              <span className="gradient-text">anywhere, instantly</span>
            </h1>

            <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience messaging with a beautiful dark interface, blazing-fast delivery,
              and seamless image sharing. Built for people who value great design.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/auth/signup')}
                className="gradient-bg text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transform hover:scale-[1.03] transition-all duration-200 shadow-[var(--shadow-glow-primary)] cursor-pointer"
              >
                Start Chatting Free
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 gradient-bg rounded-2xl opacity-20 blur-xl" />
            <div className="relative glass-strong rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-elevated)]">
              <div className="rounded-xl bg-bg-secondary p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">Team Chat</h3>
                    <p className="text-text-muted text-sm">5 members online</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2"
                      alt="User"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="bg-bg-tertiary rounded-2xl rounded-tl-md px-4 py-2.5 max-w-xs">
                      <p className="text-sm text-text">Hey team! The new design looks amazing 🎉</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="gradient-bg rounded-2xl rounded-tr-md px-4 py-2.5 max-w-xs">
                      <p className="text-sm text-white">Thanks! Ready to ship it? 🚀</p>
                    </div>
                    <img
                      src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2"
                      alt="You"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Everything you need for <span className="gradient-text">great conversations</span>
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Powerful features designed to make communication effortless
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass rounded-xl p-6 hover:bg-surface-hover transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center text-white mb-4 group-hover:shadow-[var(--shadow-glow-primary)] transition-shadow duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Shield className="h-6 w-6" />, title: "Enterprise Security", desc: "End-to-end encryption for all messages" },
              { icon: <Zap className="h-6 w-6" />, title: "99.9% Uptime", desc: "Reliable infrastructure you can count on" },
              { icon: <Sparkles className="h-6 w-6" />, title: "Modern Design", desc: "Beautiful dark interface with smooth animations" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass rounded-xl p-8 text-center"
              >
                <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center text-white mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">{item.title}</h3>
                <p className="text-text-secondary text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Ready to transform your <span className="gradient-text">conversations</span>?
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Join thousands of users who have already made the switch
            </p>
            <button
              onClick={() => navigate('/auth/signup')}
              className="gradient-bg text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transform hover:scale-[1.03] transition-all duration-200 shadow-[var(--shadow-glow-primary)] cursor-pointer"
            >
              Join now
              <ArrowRight className="inline-block ml-2 h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-text-muted text-sm">© 2026 Loop. Built with 💜</p>
        </div>
      </footer>
    </div>
  );
};