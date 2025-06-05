// src/routes/content.routes.js
import express from 'express';
import {
  getHomePageContent,
  updateHomePageContent,
  getProgramOverviewContent,
  updateProgramOverviewContent,
  getAboutUsPageContent,      
  updateAboutUsPageContent,   
  getContactUsPageContent,      
  updateContactUsPageContent,
  getUserDashboardPageContent,     
  updateUserDashboardPageContent, 
  getFooterContent,             
  updateFooterContent,
  getSiteBrandingContent,       
  updateSiteBrandingContent, 
} from '../controllers/content.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js'; 

const router = express.Router();

// Home Page Content
router.get('/home', getHomePageContent);
router.put('/home', verifyToken, isAdmin, updateHomePageContent);

// Program Overview Page Content
router.get('/program-overview', getProgramOverviewContent);
router.put('/program-overview', verifyToken, isAdmin, updateProgramOverviewContent);

// About Us Page Content
router.get('/about', getAboutUsPageContent);
router.put('/about', verifyToken, isAdmin, updateAboutUsPageContent);

// Contact Us Page Content
router.get('/contact', getContactUsPageContent);
router.put('/contact', /* isAdmin, */ updateContactUsPageContent);

// User Dashboard Page Content
router.get('/user-dashboard', getUserDashboardPageContent); 
router.put('/user-dashboard', verifyToken, isAdmin, updateUserDashboardPageContent);


// Footer Content
router.get('/footer', getFooterContent);
router.put('/footer', verifyToken, isAdmin, updateFooterContent);


// Site Branding (Header & Footer) Content
router.get('/site-branding', getSiteBrandingContent);
router.put('/site-branding', verifyToken, isAdmin, updateSiteBrandingContent);


export default router;