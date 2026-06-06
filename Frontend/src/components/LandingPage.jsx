import React from 'react';
import { 
  Activity, 
  Shield, 
  Zap, 
  Users, 
  ArrowRight, 
  MessageSquare, 
  Calendar, 
  CheckCircle2,
  Stethoscope
} from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-blue-600">AfyaClick</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
            <a href="#security" className="hover:text-blue-600 transition-colors">Security</a>
          </div>
          <button 
            onClick={onGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
              <Zap className="w-4 h-4" />
              <span>Next-Gen Healthcare Management</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Professional coordination for <span className="text-blue-600">modern healthcare</span> teams.
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Streamline patient care, automate clinical workflows, and leverage AI-powered insights with AfyaClick's secure, real-time collaboration tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-200"
              >
                Get Started Now <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4 px-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-bold">2,000+ Providers</p>
                  <p className="text-gray-500">Trust AfyaClick daily</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-blue-100/50 rounded-[2rem] blur-2xl"></div>
            <div className="relative bg-white border border-gray-100 rounded-[2rem] shadow-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070" 
                alt="Clinical Dashboard Preview" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight">Everything your clinic needs.</h2>
            <p className="text-lg text-gray-600 font-medium">Built by clinicians, for clinicians. We've removed the friction from medical administration.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6" />}
              title="AI Clinical Assistant"
              description="Automate note summaries and patient communication with our proprietary healthcare AI models."
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6" />}
              title="Smart Scheduling"
              description="Role-aware appointment management for patients, doctors, and receptionists."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="HIPAA Compliant"
              description="Enterprise-grade security and data encryption to keep sensitive patient records safe."
            />
            <FeatureCard 
              icon={<Stethoscope className="w-6 h-6" />}
              title="Patient Portal"
              description="Empower patients with easy access to their records and direct booking capabilities."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6" />}
              title="Team Collaboration"
              description="Real-time notifications and shared dashboards for seamless handoffs."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-6 h-6" />}
              title="Audit Ready"
              description="Comprehensive logging and clinical summaries designed for regulatory compliance."
            />
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section id="security" className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-green-600 mb-6 font-bold uppercase tracking-widest text-xs">
            <Shield className="w-4 h-4" />
            <span>Secure & Certified</span>
          </div>
          <h3 className="text-3xl font-bold mb-12">Trusted by leading healthcare networks</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-40 grayscale">
            {/* Mockup logos */}
            <div className="text-2xl font-black">HEALTH+</div>
            <div className="text-2xl font-black">MEDCORE</div>
            <div className="text-2xl font-black">VITALIS</div>
            <div className="text-2xl font-black">UNITYCARE</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-blue-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-8 relative z-10">Ready to transform your practice?</h2>
            <p className="text-xl text-blue-100 mb-10 relative z-10 max-w-2xl mx-auto">
              Join 2,000+ healthcare professionals who are already delivering better care with AfyaClick.
            </p>
            <button 
              onClick={onGetStarted}
              className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all shadow-2xl relative z-10 active:scale-95"
            >
              Start Your Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="text-xl font-bold text-white tracking-tight">AfyaClick</span>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Help Center</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} AfyaClick. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-500/5 group">
      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h4 className="text-xl font-bold mb-3">{title}</h4>
      <p className="text-gray-500 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
};

export default LandingPage;