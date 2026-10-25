import { useEffect } from "react";
import { useLocation } from "wouter";
import publishing from "../../publishing.json";
import { metadataForPath, validateSiteUrl } from "../metadata";

const siteUrl = validateSiteUrl(publishing.siteUrl);

export function PageMetadata() {
  const [location] = useLocation();
  useEffect(() => {
    document.head.querySelectorAll("[data-portfolio-meta]").forEach((element) => element.remove());
    for (const { tag, attrs, text } of metadataForPath(location, siteUrl, import.meta.env.BASE_URL)) {
      const element = document.createElement(tag);
      element.setAttribute("data-portfolio-meta", "");
      for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
      if (text) element.textContent = text;
      document.head.appendChild(element);
    }
  }, [location]);
  return null;
}
