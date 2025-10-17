// components/Footer.js
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaTwitter,
  FaLinkedin,
  FaPinterest,
  FaFacebook,
  FaEnvelope,
} from "react-icons/fa";

// Social handles (from your sheet)
const SOCIAL_HANDLES = {
  parent: {
    label: "Manyagi",
    instagram: "manyagiofficial",
    twitter: "manyagiofficial",
    youtube: "@manyagiofficial",
    pinterest: "manyagiofficial",
    linkedin: "manyagiofficial",
    facebook: "manyagiofficial",
    tiktok: "manyagiofficial",
  },
  publishing: {
    label: "Manyagi Publishing",
    instagram: "manyagipublishing",
    twitter: "manyagipublish",
    pinterest: "manyagipublishing",
    linkedin: "manyagipublishing",
    facebook: "manyagipublishing",
    tiktok: "manyagipublishing",
  },
  designs: {
    label: "Manyagi Designs",
    instagram: "manyagidesigns",
    twitter: "manyagidesigns",
    pinterest: "manyagidesigns",
    linkedin: "manyagidesigns",
    facebook: "manyagidesigns",
    tiktok: "manyagidesigns",
  },
  media: {
    label: "Manyagi Media",
    instagram: "manyagimedia",
    twitter: "manyagimedia",
    youtube: "@manyagimedia",
    pinterest: "manyagimedia",
    linkedin: "manyagimedia",
    facebook: "manyagimedia",
    tiktok: "manyagimedia",
  },
  capital: {
    label: "Manyagi Capital",
    instagram: "manyagicapital",
    twitter: "manyagicapital",
    linkedin: "manyagicapital",
    facebook: "manyagicapital",
    tiktok: "manyagicapital",
  },
  tech: {
    label: "Manyagi Tech",
    instagram: "manyagitech",
    twitter: "manyagitech",
    youtube: "@manyagitech",
    linkedin: "manyagitech",
    tiktok: "manyagitech",
  },
  realty: {
    label: "Manyagi Realty",
    instagram: "manyagirealty",
    twitter: "manyagirealty",
    linkedin: "manyagirealty",
    facebook: "manyagirealty",
    tiktok: "manyagirealty1",
  },
};

// Public email for each division
const DIVISION_EMAIL = {
  parent: "info@manyagi.net",
  publishing: "publishing@manyagi.net",
  designs: "designs@manyagi.net",
  media: "media@manyagi.net",
  capital: "capital@manyagi.net",
  tech: "tech@manyagi.net",
  realty: "realty@manyagi.net",
};

function platformUrl(platform, handle) {
  if (!handle) return null;
  switch (platform) {
    case "instagram": return `https://instagram.com/${handle}`;
    case "twitter": return `https://x.com/${handle.replace(/^@/, "")}`;
    case "youtube": return `https://youtube.com/${handle.startsWith("@") ? handle : `@${handle}`}`;
    case "pinterest": return `https://pinterest.com/${handle}`;
    case "linkedin": return `https://linkedin.com/company/${handle}`;
    case "facebook": return `https://facebook.com/${handle}`;
    case "tiktok": return `https://tiktok.com/@${handle.replace(/^@/, "")}`;
    default: return null;
  }
}

function Icon({ name }) {
  switch (name) {
    case "instagram": return <FaInstagram />;
    case "tiktok": return <FaTiktok />;
    case "youtube": return <FaYoutube />;
    case "twitter": return <FaTwitter />;
    case "linkedin": return <FaLinkedin />;
    case "pinterest": return <FaPinterest />;
    case "facebook": return <FaFacebook />;
    default: return null;
  }
}

export default function Footer({ division: override }) {
  const router = useRouter();

  const division = override || (() => {
    const p = router.pathname || "";
    if (p.includes("/publishing")) return "publishing";
    if (p.includes("/designs")) return "designs";
    if (p.includes("/media")) return "media";
    if (p.includes("/capital")) return "capital";
    if (p.includes("/tech")) return "tech";
    if (p.includes("/realty")) return "realty";
    return "parent";
  })();

  const cfg = SOCIAL_HANDLES[division] || SOCIAL_HANDLES.parent;
  const email = DIVISION_EMAIL[division] || DIVISION_EMAIL.parent;

  const ORDER = ["instagram", "tiktok", "youtube", "twitter", "linkedin", "pinterest", "facebook"];
  let links = ORDER.map(p => {
    const url = platformUrl(p, cfg[p]);
    return url ? { p, url } : null;
  }).filter(Boolean);

  // Always show Manyagi Media YouTube on non-home pages
  if (division !== "parent" && !links.some(l => l.url.includes("@manyagimedia"))) {
    links.push({ p: "youtube", url: "https://youtube.com/@manyagimedia" });
  }

  return (
    <footer className="bg-white text-black py-8 border-t border-gray-200">
      <div className="container mx-auto px-4 flex flex-col gap-6">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm">
            © {new Date().getFullYear()} {cfg.label}. All rights reserved.
          </div>
          <div className="flex gap-5 text-sm">
            <Link href="/privacy" className="hover:text-yellow-500">Privacy</Link>
            <Link href="/terms" className="hover:text-yellow-500">Terms</Link>
            <Link href="/about" className="hover:text-yellow-500">About</Link>
          </div>
        </div>

        {/* Contact + socials */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <FaEnvelope />
              <span>Contact:</span>
            </div>
            <a href={`mailto:${email}`} className="underline hover:text-yellow-600 mt-1 block">
              {email}
            </a>
          </div>

          <div className="flex items-center gap-4 text-xl">
            {links.map(({ p, url }) => (
              <a
                key={p}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-500 transition-colors"
              >
                <Icon name={p} />
              </a>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <div className="text-center text-sm text-gray-600 border-t border-gray-200 pt-4">
          Creativity Meets Innovation
        </div>
      </div>
    </footer>
  );
}
