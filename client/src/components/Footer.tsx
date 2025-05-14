import { Link } from "react-router-dom"
import logo from "../assets/logo.jpg"

export default function Footer() {
  return (
    <footer className="w-full py-8 sm:py-10 md:py-12 bg-[#FFF8F0] dark:bg-[#2A0F0F] border-t border-[#C5A467]/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-8">
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Apostolic & Evangelical Theology Logo" className="h-10 w-10 rounded-full object-cover shadow-md border-2 border-[#C5A467]/50" />
              <span className="font-serif font-bold text-lg text-[#2A0F0F] dark:text-[#E0D6C3]">
                Apostolic Theology
              </span>
            </div>
            <p className="text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80">
              © {new Date().getFullYear()} International Apostolic Church. All rights reserved.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center md:items-end md:text-right gap-4">
            <nav className="flex flex-col sm:flex-row gap-y-2 gap-x-4 md:gap-x-6">
              <Link
                to="/about"
                className="font-serif text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="font-serif text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] transition-colors"
              >
                Contact
              </Link>
            </nav>
            <nav className="flex flex-col sm:flex-row gap-y-2 gap-x-4 md:gap-x-6">
              <Link
                to="/privacy"
                className="font-serif text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="font-serif text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] transition-colors"
              >
                Terms of Use
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#C5A467]/20 text-center">
          <p className="text-xs sm:text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80">
            "Study to shew thyself approved unto God..." - 2 Timothy 2:15
          </p>
        </div>
      </div>
    </footer>
  )
}