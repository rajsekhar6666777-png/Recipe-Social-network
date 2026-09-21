import React from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaHeart, FaGithub, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.topSection}>
          <div style={styles.brand}>
            <div style={styles.logo}>
              <FaUtensils style={{ color: 'var(--primary)' }} />
              <span>RecipeSocial</span>
            </div>
            <p style={styles.description}>
              The ultimate social platform for home chefs, food lovers, and culinary artists. Share your secret recipes, discover global cuisines, plan weekly meals, and rate top dishes.
            </p>
          </div>

          <div style={styles.linksColumn}>
            <h4 style={styles.heading}>Explore</h4>
            <Link to="/explore?category=Breakfast" style={styles.link}>Breakfast</Link>
            <Link to="/explore?category=Lunch" style={styles.link}>Lunch</Link>
            <Link to="/explore?category=Dinner" style={styles.link}>Dinner</Link>
            <Link to="/explore?category=Dessert" style={styles.link}>Desserts</Link>
            <Link to="/explore?category=Street Food" style={styles.link}>Street Food</Link>
          </div>

          <div style={styles.linksColumn}>
            <h4 style={styles.heading}>Features</h4>
            <Link to="/explore?section=trending" style={styles.link}>Trending Recipes</Link>
            <Link to="/meal-planner" style={styles.link}>Weekly Meal Planner</Link>
            <Link to="/shopping-list" style={styles.link}>Grocery Shopping List</Link>
            <Link to="/dashboard" style={styles.link}>Chef Analytics</Link>
          </div>

          <div style={styles.linksColumn}>
            <h4 style={styles.heading}>Community & Support</h4>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("RecipeSocial FAQ: Share recipes, rate with 5 stars, plan meals, and export shopping lists!"); }} style={styles.link}>FAQ & Help</a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Privacy Policy: Your data is secure and protected under RecipeSocial terms."); }} style={styles.link}>Privacy Policy</a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Terms of Service: Respectful social culinary interactions required."); }} style={styles.link}>Terms of Service</a>
            <div style={styles.socials}>
              <a href="#" style={styles.socialIcon}><FaGithub /></a>
              <a href="#" style={styles.socialIcon}><FaTwitter /></a>
              <a href="#" style={styles.socialIcon}><FaInstagram /></a>
              <a href="#" style={styles.socialIcon}><FaLinkedin /></a>
            </div>
          </div>
        </div>

        <div style={styles.bottomSection}>
          <p>© {new Date().getFullYear()} RecipeSocial Network. Crafted with <FaHeart style={{ color: '#e63946', margin: '0 4px' }} /> for Internship Portfolio Project.</p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: 'var(--bg-card)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '3rem',
    paddingBottom: '1.5rem',
    marginTop: 'auto',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },
  topSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '2.5rem',
    marginBottom: '2.5rem',
  },
  brand: {
    gridColumn: 'span 2',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.4rem',
    fontWeight: '700',
    fontFamily: "'Playfair Display', Georgia, serif",
    marginBottom: '0.8rem',
  },
  description: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    maxWidth: '380px',
  },
  heading: {
    fontSize: '0.95rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: 'var(--text-main)',
  },
  linksColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  link: {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    transition: 'var(--transition)',
  },
  socials: {
    display: 'flex',
    gap: '0.6rem',
    marginTop: '0.5rem',
  },
  socialIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'var(--bg-input)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-main)',
    transition: 'var(--transition)',
    fontSize: '0.9rem',
  },
  bottomSection: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default Footer;
