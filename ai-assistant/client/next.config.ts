import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  basePath: '/ai',
  images: {
    domains: [
      'tourismus.saarbruecken.de',
      'einkaufen.saarbruecken.de',
      'maps.googleapis.com',
      'upload.wikimedia.org',
      'www.tourismus.saarland',
      'www.saarbruecken.de',
      'www.trier-info.de',
      'metz.fr',
      'visitluxembourg.com',
      'www.modernegalerie.org'
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
