"use client"
import { Shield, FileCheck, Clock, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function Home() {

   const router = useRouter();
  const handleKycStartClick = () =>{
    router.push('/create-user')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SharmaKYC</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition">Features</a>
            <a href="#process" className="text-gray-600 hover:text-blue-600 transition">Process</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 transition">Contact</a>
            {/* <button className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition">
              Sign In
            </button> */}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Secure & Compliant Verification</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Complete Your KYC in
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Minutes</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Fast, secure, and seamless identity verification. Get verified today and unlock access to our complete suite of services.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="cursor-pointer w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2" onClick={handleKycStartClick}>
              <span>Start Verification</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition border border-gray-300" onClick={handleKycStartClick}>
              Learn More
            </button>
          </div>
          {/* //comment  */}
          
          <div className="flex items-center justify-center space-x-8 mt-12 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SharmaKYC?</h2>
          <p className="text-xl text-gray-600">Trusted by thousands of users worldwide</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Quick Verification</h3>
            <p className="text-gray-600">Complete your KYC in under 5 minutes with our streamlined process. No lengthy paperwork required.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Bank-Grade Security</h3>
            <p className="text-gray-600">Your data is encrypted with industry-leading security standards and never shared without consent.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Approval</h3>
            <p className="text-gray-600">Get real-time verification status updates and instant approval notifications upon completion.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Verified?</h2>
          <p className="text-xl mb-8 text-blue-100">Join thousands of verified users today</p>
          <button className="cursor-pointer px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg inline-flex items-center space-x-2" onClick={handleKycStartClick}>
            <span>Begin KYC Process</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SharmaKYC</span>
          </div>
          <p className="text-gray-600 text-sm">© 2025 SharmaKYC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}