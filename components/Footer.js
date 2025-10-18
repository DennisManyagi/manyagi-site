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

// ===== Social handles you provided =====
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

// ===== Public email per division (homepage uses info@) =====
const DIVISION_EMAIL = {
  parent: "info@manyagi.net",
  publishing: "publishing@manyagi.net",
  designs: "designs@manyagi.net",
  media: "media@manyagi.net",
  capital: "capital@manyagi.net",
  tech: "tech@manyagi.net",
  realty: "realty@manyagi.net",
};

// ===== Short “blurb” to add context + pizazz =====
const DIVISION_BLURB = {
  parent:
    "Manyagi is a creative technology company building IP across publishing, media, commerce, capital, tech, and realty.",
  publishing:
    "Original fiction, poetry, and world-building IP — released as ebooks, print, and collectors’ editions.",
  designs:
    "Wear the worlds we build — tees, posters, mugs, and collectibles inspired by our stories.",
  media:
    "Shorts, reels, and long-form content documenting how we build a modern IP studio in public.",
  capital:
    "The creator’s capital desk — systematic trading and portfolio construction, shared transparently.",
  tech:
    "Sites, tools, automations — shipping product daily and showing our work along the way.",
  realty:
    "Story-inspired stays and property content in destinations we love.",
};

// ===== helpers =====
function platformUrl(platform, handle) {
  if (!handle) return null;
  switch (platform) {
    case "instagram": return `https://instagram.com/${handle}`;
    case "twitter":   return `https://x.com/${handle.replace(/^@/, "")}`;
    case "youtube":   return `https://youtube.com/${handle.startsWith("@") ? handle : `@${handle}`}`;
    case "pinterest": return `https://pinterest.com/${handle}`;
    case "linkedin":  return `https://linkedin.com/company/${handle}`;
    case "facebook":  return `https://facebook.com/${handle}`;
    case "tiktok":    return `https://tiktok.com/@${handle.replace(/^@/, "")}`;
    default:          return null;
  }
}

function Icon({ name }) {
  switch (name) {
    case "instagram": return <FaInstagram />;
    case "tiktok":    return <FaTiktok />;
    case "youtube":   return <FaYoutube />;
    case "twitter":   return <FaTwitter />;
    case "linkedin":  return <FaLinkedin />;
    case "pinterest": return <FaPinterest />;
    case "facebook":  return <FaFacebook />;
    default:          return null;
  }
}

export default function Footer({ division: override }) {
  const router = useRouter();

  const division = override || (() => {
    const p = router.pathname || "";
    if (p.startsWith("/publishing")) return "publishing";
    if (p.startsWith("/designs"))    return "designs";
    if (p.startsWith("/media"))      return "media";
    if (p.startsWith("/capital"))    return "capital";
    if (p.startsWith("/tech"))       return "tech";
    if (p.startsWith("/realty"))     return "realty";
    return "parent";
  })();

  const cfg   = SOCIAL_HANDLES[division] || SOCIAL_HANDLES.parent;
  const email = DIVISION_EMAIL[division] || DIVISION_EMAIL.parent;
  const blurb = DIVISION_BLURB[division] || DIVISION_BLURB.parent;

  const ORDER = ["instagram", "tiktok", "youtube", "twitter", "linkedin", "pinterest", "facebook"];
  let links = ORDER.map((p) => {
    const url = platformUrl(p, cfg[p]);
    return url ? { p, url } : null;
  }).filter(Boolean);

  // Always add Manyagi Media YouTube on division pages (not homepage)
  if (division !== "parent" && !links.some(l => l.url.includes("@manyagimedia"))) {
    links.push({ p: "youtube", url: "https://youtube.com/@manyagimedia" });
  }

  return (
    <footer className="bg-white text-black border-t border-gray-200">
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About / blurb */}
        <div>
          <h4 className="text-xl font-bold mb-2">
            {division === "parent" ? "Manyagi" : cfg.label}
          </h4>
          <p className="text-sm text-gray-700">{blurb}</p>
        </div>

        {/* Explore quick links */}
        <div className="text-sm">
          <h5 className="font-semibold mb-2">Explore</h5>
          <ul className="space-y-1">
            <li><Link href="/publishing" className="hover:text-yellow-600">Publishing</Link></li>
            <li><Link href="/designs"    className="hover:text-yellow-600">Designs</Link></li>
            <li><Link href="/media"      className="hover:text-yellow-600">Media</Link></li>
            <li><Link href="/capital"    className="hover:text-yellow-600">Capital</Link></li>
            <li><Link href="/tech"       className="hover:text-yellow-600">Tech</Link></li>
            <li><Link href="/realty"     className="hover:text-yellow-600">Realty</Link></li>
            <li><Link href="/blog"       className="hover:text-yellow-600">Blog</Link></li>
          </ul>
        </div>

        {/* Contact + socials */}
        <div className="text-sm">
          <h5 className="font-semibold mb-2 flex items-center gap-2">
            <FaEnvelope /> Contact
          </h5>
          <a href={`mailto:${email}`} className="underline hover:text-yellow-600 break-all">
            {email}
          </a>
          <div className="mt-4 flex flex-wrap gap-3 text-xl">
            {links.map(({ p, url }) => (
              <a
                key={`${p}-${url}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-600 transition-colors"
                title={p}
              >
                <Icon name={p} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Legal row + tagline moved from Header to Footer */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-700">
          <div>© {new Date().getFullYear()} {cfg.label}. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-yellow-600">Privacy</Link>
            <Link href="/terms"   className="hover:text-yellow-600">Terms</Link>
            <Link href="/about"   className="hover:text-yellow-600">About</Link>
          </div>
          <div className="text-gray-600">Creativity Meets Innovation</div>
        </div>
      </div>
    </footer>
  );
}
