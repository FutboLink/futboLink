"use client";

import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import type { OrganizationPageSocialMedia } from "@/types/organizationPage";

interface SocialMediaIconsProps {
  socialMedia: OrganizationPageSocialMedia | null | undefined;
  className?: string;
}

const SocialMediaIcons: React.FC<SocialMediaIconsProps> = ({
  socialMedia,
  className,
}) => {
  if (!socialMedia) return null;

  const entries: Array<{
    key: keyof OrganizationPageSocialMedia;
    label: string;
    Icon: IconType;
    color: string;
  }> = [
    { key: "instagram", label: "Instagram", Icon: FaInstagram, color: "text-pink-600 hover:bg-pink-50" },
    { key: "twitter", label: "Twitter", Icon: FaTwitter, color: "text-sky-500 hover:bg-sky-50" },
    { key: "youtube", label: "YouTube", Icon: FaYoutube, color: "text-red-600 hover:bg-red-50" },
    { key: "facebook", label: "Facebook", Icon: FaFacebookF, color: "text-blue-600 hover:bg-blue-50" },
    { key: "tiktok", label: "TikTok", Icon: FaTiktok, color: "text-gray-800 hover:bg-gray-100" },
  ];

  const active = entries.filter((e) => socialMedia[e.key] && socialMedia[e.key]!.trim() !== "");
  if (active.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      {active.map(({ key, label, Icon, color }) => (
        <a
          key={key}
          href={socialMedia[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm transition-colors ${color}`}
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
};

export default SocialMediaIcons;
