import { Link } from "react-router-dom"
import { Cross } from "lucide-react"
import logo from "../assets/logo.jpg"

export default function Footer() {
  return (
    <footer className="w-full py-8 bg-[#FFF8F0] dark:bg-[#2A0F0F] border-t border-[#C5A467]/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
            <img src={logo} alt="Apostolic & Evangelical Theology Logo" className="h-10 w-10 md:h-10 md:w-10 mx-auto rounded-full object-cover mb-4 shadow-md border-2 border-[#C5A467]/50" />
              <span className="font-serif font-bold text-lg text-[#2A0F0F] dark:text-[#E0D6C3]">
                Apostolic Theology
              </span>
            </div>
            <p className="text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80 text-center md:text-left">
              &copy; {new Date().getFullYear()} International Apostolic Church. All rights reserved.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
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
             
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
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
              <Link
                to="/faq"
                className="font-serif text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] transition-colors"
              >
                FAQs
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#C5A467]/20 text-center">
          <p className="text-xs text-[#4A1F1F] dark:text-[#E0D6C3]/80">
            "Study to shew thyself approved unto God..." - 2 Timothy 2:15
          </p>
        </div>
      </div>
    </footer>
  )
}